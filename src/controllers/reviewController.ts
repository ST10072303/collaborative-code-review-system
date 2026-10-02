import { Request, Response } from "express";
import pool from "../config/db";

// approve a code submission, only reviewers can approve submissions.
export const approveSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // Only reviewers can approve submissions.
        if (req.user.role !== "reviewer") {
            res.status(403).json({message: "Only reviewers can approve submissions."});
            return;
        }

        // Get the submission ID from the URL.
        const submissionId = Number(req.params.id);

        // Validate the submission ID.
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // optional comment explaining the approval.
        const { comment } = req.body;

        // find the submission and make sure the reviewer has access to its project.
        const submissionResult = await pool.query(`SELECT s.id
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE s.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [submissionId, req.user.userId]);

        if (submissionResult.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }

        // update the submission status.
        const updateResult = await pool.query(`UPDATE submissions SET status = 'approved', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 RETURNING id, project_id, submitted_by, title, code, language, status, created_at, updated_at `,
            [submissionId]);

        // record the approval in review history.
        await pool.query(`INSERT INTO review_history (submission_id, reviewer_id, action, comment)
            VALUES ($1, $2, 'approved', $3)`,[submissionId, req.user.userId, comment || null]);

        res.status(200).json({message: "Submission approved successfully.", submission: updateResult.rows[0]});
    } catch (error) {
        console.error("Approve submission error:", error);
        res.status(500).json({message: "An error occurred while approving the submission."});
    }
};

// request changes to a code submission, only reviewers can request changes.
 export const requestChanges = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // only reviewers can request changes
        if (req.user.role !== "reviewer") {
            res.status(403).json({message: "Only reviewers can request changes."});
            return;
        }

        // Convert the submission ID from the URL to a number
        const submissionId = Number(req.params.id);

        // validate the submission ID
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // get the reviewer's comment from the request body
        const { comment } = req.body;

        // a reason should be provided when requesting changes
        if (!comment || comment.trim() === "") {
            res.status(400).json({message: "A comment is required when requesting changes."});
            return;
        }

        // check whether the reviewer has access to the project that contains this submission.
        const submissionResult = await pool.query(`SELECT s.id
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE s.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [submissionId, req.user.userId]);

        if (submissionResult.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }

        // update the submission status
        const updateResult = await pool.query(`UPDATE submissions SET status = 'changes_requested', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 RETURNING id, project_id, submitted_by, title, code, language, status, created_at, updated_at `,[submissionId]);

        // save the review action and comment
        await pool.query(`INSERT INTO review_history (submission_id, reviewer_id, action, comment)
            VALUES ($1, $2, 'changes_requested', $3)`,[submissionId, req.user.userId, comment.trim()]);

        // return the updated submission
        res.status(200).json({message: "Changes requested successfully.", submission: updateResult.rows[0]});

    } catch (error) {
        console.error("Request changes error:", error);
        res.status(500).json({message: "An error occurred while requesting changes."});
    }
};