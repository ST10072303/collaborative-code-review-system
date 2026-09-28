import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";

// Register a new user.
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        // basic validation.
        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email and password are required.", });
            return;
        }
        // only the roles supported by our application are allowed.
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
        // Hash the password before saving it.
        const passwordHash = await bcrypt.hash(password, 10);

        // add the new user into PostgreSQL.
        const result = await pool.query(` INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, display_picture, created_at
             `, [name, email, passwordHash, userRole]);

        // Return the newly created user.
        res.status(201).json({message: "User registered successfully.",user: result.rows[0],});
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Internal server error.",});
    }
};