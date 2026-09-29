import { Request, Response } from "express";
import pool from "../config/db";

// Get a user by their ID.
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get the user ID from the URL.
        const userId = Number(req.params.id);

        // Make sure the ID is a valid number.
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid user ID." });
            return;
        }

        // Find the user in the database.
        const result = await pool.query(`SELECT id, name, email, role, display_picture,
                created_at, updated_at FROM users WHERE id = $1 `, [userId]);

        // User does not exist.
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Return the user information.
        // Notice that password_hash is NOT selected.
        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "An error occurred while retrieving the user." });
    }
};

// update a user profile.
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // get user ID from the URL.
        const userId = Number(req.params.id);

        // check if ID is a valid number.
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid user ID." });
            return;
        }

        // make sure the authenticated user is updating their own account.
        if (!req.user || req.user.userId !== userId) {
            res.status(403).json({ message: "You can only update your own profile." });
            return;
        }

        // get the fields that can be updated.
        const { name, email, display_picture } = req.body;

        // At least one field must be supplied.
        if (name === undefined && email === undefined && display_picture === undefined) {
            res.status(400).json({ message: "At least one field is required to update the profile." });
            return;
        }

        // update the user.
        const result = await pool.query(` UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
            display_picture = COALESCE($3, display_picture), updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 RETURNING id, name, email, role, display_picture, created_at, updated_at `,
            [name, email, display_picture, userId]);

        // user does not exist.
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        res.status(200).json({ message: "User updated successfully.", user: result.rows[0] });
    } catch (error: any) {
        console.error("User update error:", error);

        // PostgreSQL error code 23505 means a unique constraint was violated.
        if (error.code === "23505") {
            res.status(409).json({ message: "Email address is already in use." });
            return;
        }
        res.status(500).json({ message: "An error occurred while updating the user." });
    }
};

// Delete a user.
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // get the user ID from the URL.
        const userId = Number(req.params.id);

        // make sure the ID is a valid number.
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid user ID." });
            return;
        }

        // make sure the authenticated user is deleting their own account.
        if (!req.user || req.user.userId !== userId) {
            res.status(403).json({ message: "You can only delete your own account." });
            return;
        }

        // delete the user from the database.
        const result = await pool.query(`DELETE FROM users
            WHERE id = $1 RETURNING id`, [userId]);

        // user does not exist.
        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "An error occurred while deleting the user." });
    }
};