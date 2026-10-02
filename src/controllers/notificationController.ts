import { Request, Response } from "express";
import pool from "../config/db";

// get all notifications for the currently authenticated user.
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // get notifications belonging only to the logged-in user.
        const result = await pool.query(`SELECT id, message, is_read, created_at
            FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,[req.user.userId]);

        res.status(200).json({notifications: result.rows});

    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({message: "An error occurred while retrieving notifications."});
    }
};

// mark one notification as read, a user can only mark their own notification as read.
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // convert the notification ID from the URL to a number.
        const notificationId = Number(req.params.id);

        // validate the ID.
        if (isNaN(notificationId)) {
            res.status(400).json({message: "Invalid notification ID."});
            return;
        }

        // Update only a notification belonging to the logged-in user.
        const result = await pool.query(`UPDATE notifications SET is_read = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING id, message, is_read, created_at`, [notificationId, req.user.userId]);

        // if no row was updated, the notification either does not exist or belongs to another user.
        if (result.rows.length === 0) {
            res.status(404).json({message: "Notification not found."});
            return;
        }
        res.status(200).json({message: "Notification marked as read.", notification: result.rows[0]});

    } catch (error) {
        console.error("Mark notification as read error:", error);
        res.status(500).json({message: "An error occurred while updating the notification."});
    }
};