import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import jwt from "jsonwebtoken";

// register a new user.
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        // basic validation.
        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email and password are required.", });
            return;
        }
        // only the roles supported by the app are allowed.
        const userRole = role || "submitter";
        if (!["submitter", "reviewer"].includes(userRole)) {
            res.status(400).json({ message: "Role must be either submitter or reviewer.", });
            return;
        }
        // check whether another user already has this email.
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "A user with this email already exists.", });
            return;
        }
        // hash the password before saving it.
        const passwordHash = await bcrypt.hash(password, 10);

        // add the new user into PostgreSQL.
        const result = await pool.query(` INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, display_picture, created_at
             `, [name, email, passwordHash, userRole]);

        // return the newly created user.
        res.status(201).json({ message: "User registered successfully.", user: result.rows[0], });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error.", });
    }
};

// login an existing user.
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // get the email and password from the request body.
        const { email, password } = req.body;

        // make sure both fields are provided.
        if (!email || !password) {
            res.status(400).json({message: "Email and password are required."});
            return;
        }

        // find the user by email.
        const result = await pool.query(`SELECT id, name, email, password_hash, role, display_picture, created_at
                FROM users WHERE email = $1`, [email]);

        // if no user is found, reject the login.
        if (result.rows.length === 0) {
            res.status(401).json({message: "Invalid email or password."});
            return;
        }

        const user = result.rows[0];
        // Compare the plain-text password supplied by the user
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        // If the passwords don't match, reject the login.
        if (!passwordMatches) {
            res.status(401).json({message: "Invalid email or password."});
            return;
        }

        // get the JWT secret from the .env file.
        const jwtSecret = process.env.JWT_SECRET;

        // the application cannot create a secure JWT without  a secret key.
        if (!jwtSecret) {
            res.status(500).json({message: "JWT secret is not configured."});
            return;
        }

        //  create the JWT token.
        const token = jwt.sign({userId: user.id, role: user.role}, jwtSecret, {expiresIn: "1h"});

        // send the successful login response.
        res.status(200).json({message: "Login successful.", token,
            user: {id: user.id, name: user.name, email: user.email, role: user.role,
            display_picture: user.display_picture, created_at: user.created_at}
        });

    } catch (error) {
        // handle unexpected errors such as database errors.
        console.error("Login error:", error);
        res.status(500).json({message: "Internal server error."});
    }
};