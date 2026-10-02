import { Request, Response } from "express";
import pool from "../config/db";

// get statistics for the currently authenticated user.
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        const userId = req.user.userId;

        // count projects created by the current user.
        const projectResult = await pool.query(`SELECT COUNT(*) AS total_projects
            FROM projects
            WHERE created_by = $1`, [userId]);

        // Count the user's submissions by status.
        const submissionResult = await pool.query(`SELECT COUNT(*) AS total_submissions, COUNT(*) FILTER (
            WHERE status = 'pending' ) AS pending_submissions, COUNT(*) FILTER (WHERE status = 'in_review') AS in_review_submissions,
            COUNT(*) FILTER (WHERE status = 'approved') AS approved_submissions,
            COUNT(*) FILTER (WHERE status = 'changes_requested') AS changes_requested_submissions
            FROM submissions
            WHERE submitted_by = $1`, [userId]);

        // count comments received on the user's submissions.
        const commentResult = await pool.query(`SELECT COUNT(*) AS total_review_comments
            FROM comments c INNER JOIN submissions s ON c.submission_id = s.id
            WHERE s.submitted_by = $1`, [userId]);

        res.status(200).json({statistics: {totalProjects: Number(projectResult.rows[0].total_projects),
                totalSubmissions: Number(submissionResult.rows[0].total_submissions),
                pendingSubmissions: Number(submissionResult.rows[0].pending_submissions),
                inReviewSubmissions: Number(submissionResult.rows[0].in_review_submissions),
                approvedSubmissions: Number(submissionResult.rows[0].approved_submissions),
                changesRequestedSubmissions: Number(submissionResult.rows[0].changes_requested_submissions),
                totalReviewComments: Number(commentResult.rows[0].total_review_comments)
            }
        });

    } catch (error) {
        console.error("Get user statistics error:", error);
        res.status(500).json({message: "An error occurred while retrieving statistics."});
    }
};