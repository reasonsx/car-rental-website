import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi from "joi";

import { UserModel } from "../user/user.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}

// ========================
// VALIDATION SCHEMAS
// ========================

const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const BCRYPT_MAX_BYTES = 72;
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function rejectHtmlTags(value: string, helpers: Joi.CustomHelpers) {
  if (HTML_TAG_PATTERN.test(value)) {
    return helpers.error("string.htmlTag");
  }

  return value;
}

function rejectControlCharacters(value: string, helpers: Joi.CustomHelpers) {
  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    return helpers.error("string.controlCharacter");
  }

  return value;
}

function enforcePasswordByteLimit(value: string, helpers: Joi.CustomHelpers) {
  if (Buffer.byteLength(value, "utf8") > BCRYPT_MAX_BYTES) {
    return helpers.error("string.maxBytes");
  }

  return value;
}

const nameSchema = Joi.string()
  .trim()
  .min(3)
  .max(NAME_MAX_LENGTH)
  .required()
  .custom(rejectHtmlTags)
  .custom(rejectControlCharacters)
  .messages({
    "any.required": "Name is required",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must not exceed 100 characters",
    "string.htmlTag": "Name cannot contain HTML tags",
    "string.controlCharacter": "Name contains invalid characters",
  });

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .max(EMAIL_MAX_LENGTH)
  .required()
  .custom(rejectHtmlTags)
  .custom(rejectControlCharacters)
  .messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "string.max": "Email must not exceed 254 characters",
    "string.htmlTag": "Email cannot contain HTML tags",
    "string.controlCharacter": "Email contains invalid characters",
  });

const newPasswordSchema = Joi.string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .required()
  .custom(enforcePasswordByteLimit)
  .custom(rejectHtmlTags)
  .custom(rejectControlCharacters)
  .messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 64 characters",
    "string.maxBytes": "Password is too long for secure storage",
    "string.htmlTag": "Password cannot contain HTML tags",
    "string.controlCharacter": "Password contains invalid characters",
  });

const registerSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password is required",
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password is required",
  }),
  newPassword: newPasswordSchema,
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await UserModel.findOne({ email: value.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const user = await UserModel.create({
      name: value.name,
      email: value.email,
      password: hashedPassword,
    });

    res.status(201).json({
      error: null,
      data: {
        id: user._id.toString(),
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to register user" });
  }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await UserModel.findOne({ email: value.email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "2h" },
    );

    res.json({
      error: null,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to login user" });
  }
}

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error / incorrect password
 */
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    const user = await UserModel.findById(req.user?.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ error: null, data: "Password changed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
}

// ========================
// VERIFY TOKEN (MIDDLEWARE)
// ========================

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    req.user = jwt.verify(token, secret) as AuthRequest["user"];

    if (!req.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if user is deleted
    const user = await UserModel.findById(req.user.id);
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
