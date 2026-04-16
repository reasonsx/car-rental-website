import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi, { ValidationResult } from "joi";
import { UserModel } from "../models/userModel";
import { User } from "../interfaces/user";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        isAdmin?: boolean;
    };
}

export async function registerUser(req: Request, res: Response) {
    try {
        const { error } = validateUserRegistrationInfo(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const emailExists = await UserModel.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(
            req.body.password,
            await bcrypt.genSalt(10)
        );

        const user = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ error: null, data: user._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to register user: " + error });
    }
}

export function validateUserRegistrationInfo(data: User): ValidationResult {
    return Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }).validate(data);
}

export function validateUserLoginInfo(data: User): ValidationResult {
    return Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }).validate(data);
}

export async function loginUser(req: Request, res: Response) {
    try {
        const { error } = validateUserLoginInfo(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await UserModel.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            process.env.TOKEN_SECRET as string,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            error: null,
            data: {
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to auth user: " + error });
    }
}

export function verifyToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.header("auth-token");

    if (!token) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    try {
        req.user = jwt.verify(
            token,
            process.env.TOKEN_SECRET as string
        ) as AuthRequest["user"];

        next();
    } catch {
        return res.status(400).json({
            message: "Invalid token."
        });
    }
}