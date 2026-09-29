import { Request, Response } from "express";
import pool from "../config/db";

// Get a user by their ID.
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get the user ID from the URL.
        const userId = Number(req.params.id);

        // Make sure the ID is a valid number.
        if (isNaN(userId)) {
            res.status(400).json({message: "Invalid user ID."});
            return;
        }

        // Find the user in the database.
        const result = await pool.query(`SELECT id, name, email, role, display_picture,
                created_at, updated_at FROM users WHERE id = $1 `,[userId]);

        // User does not exist.
        if (result.rows.length === 0) {
            res.status(404).json({message: "User not found."});
            return;
        }

        // Return the user information.
        // Notice that password_hash is NOT selected.
        res.status(200).json({user: result.rows[0]});
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({message: "An error occurred while retrieving the user."});
    }
};