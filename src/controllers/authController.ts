// imports
import {
  type Request,
  type Response,
  type NextFunction
} from "express";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import Joi, { ValidationResult } from "joi";

// Project imports
import { UserModel } from "../models/userModel";
import { User } from "../interfaces/user";
import { connect, disconnect } from '../repository/database';

/**
 * Controller for handling user authentication and registration.
 * This includes functions for registering a new user, logging in an existing user, and verifying JWT tokens.
 */
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
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const userOject = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        const savedUser = await userOject.save();
        res.status(201).json({ error: null, data: savedUser._id });
 
    } catch (error) {

        res.status(500).json({ message: "Failed to register user: " + error });

    } 
}

export function validateUserRegistrationInfo(data: User): ValidationResult {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

export function validateUserLoginInfo(data: User): ValidationResult {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

export async function loginUser(req: Request, res: Response) {
    try {

        const { error } = validateUserLoginInfo(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user: User | null = await UserModel.findOne({ email: req.body.email });
        
        if (!user) {

        
            return res.status(400).json({ message: "Invalid email or password" });

        } else {

            const validPassword:boolean = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

           const userId = user._id.toString();
            const token = jwt.sign(
                {
                    name: user.name,
                    email: user.email,
                    id: userId
                },
                process.env.TOKEN_SECRET as string,
                { expiresIn: '2h' }
                
            );
             // ✅ Return the token and user info (including name) so frontend can use it
                res.status(200)
                .header("auth-token", token)
                .json({
                    error: null,
                    data: {
                        token,
                        user: {
                            id: userId,
                            name: user.name,
                            email: user.email,
                            isAdmin: user.isAdmin
                        }
                    }
                });
                }


    } catch (error) {

        res.status(500).json({ message: "Failed to login user: " + error });

    } 
}

  export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {

        if(token){
            jwt.verify(token, process.env.TOKEN_SECRET as string);
        }
        next();

    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }


  }