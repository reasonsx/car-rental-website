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

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ========================
// REGISTER
// ========================

export async function registerUser(req: Request, res: Response) {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
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

// ========================
// LOGIN
// ========================

export async function loginUser(req: Request, res: Response) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
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

// ========================
// VERIFY TOKEN (MIDDLEWARE)
// ========================

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
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

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
