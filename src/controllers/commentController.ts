import { Request, Response } from "express";
import pool from "../config/db";

// create a comment on a submission.
export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // only reviewers can comment.
        if (req.user.role !== "reviewer") {
            res.status(403).json({message: "Only reviewers can comment on submissions."});
            return;
        }

        // get the submission ID from the URL.
        const submissionId = Number(req.params.submissionId);
        // get comment details from the request body.
        const { content, line_number } = req.body;

        // validate the submission ID.
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // validate comment content.
        if (!content) {
            res.status(400).json({message: "Comment content is required."});
            return;
        }

        // validate line_number supplied.
        if (line_number !== undefined && (!Number.isInteger(Number(line_number)) ||Number(line_number) <= 0)) {
            res.status(400).json({message: "Line number must be a positive integer."});
            return;
        }

        // check that the submission exists and that the reviewer has access to its project.
        const submissionResult = await pool.query(`SELECT s.id
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE s.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [submissionId, req.user.userId]);

        if (submissionResult.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }

        // create the comment.
        const result = await pool.query(`INSERT INTO comments (submission_id, user_id, content, line_number)
            VALUES ($1, $2, $3, $4)
            RETURNING id, submission_id, user_id, content, line_number, created_at, updated_at`,
            [submissionId, req.user.userId, content, line_number !== undefined ? Number(line_number): null]);

        res.status(201).json({message: "Comment created successfully.", comment: result.rows[0]});
    } catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({message: "An error occurred while creating the comment."});
    }
};

// get all comments for a submission.
 export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }
        const submissionId = Number(req.params.submissionId);

        // validate the submission ID.
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // check whether the user has access to the submission.
        const accessResult = await pool.query(`SELECT s.id
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE s.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [submissionId, req.user.userId]);

        if (accessResult.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }

        // retrieve comments.
        const result = await pool.query(`SELECT c.id, c.submission_id, c.user_id, u.name AS user_name, u.email AS user_email, c.content,
            c.line_number, c.created_at, c.updated_at
                FROM comments c INNER JOIN users u ON c.user_id = u.id WHERE c.submission_id = $1 ORDER BY c.created_at ASC`, [submissionId]);

        res.status(200).json({comments: result.rows});
    } catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({message: "An error occurred while retrieving comments."});
    }
};

// update a comment.
 export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // only reviewers can manage comments.
        if (req.user.role !== "reviewer") {
            res.status(403).json({message: "Only reviewers can update comments."});
            return;
        }

        const commentId = Number(req.params.id);
        // validate the comment ID.
        if (isNaN(commentId)) {
            res.status(400).json({message: "Invalid comment ID."});
            return;
        }
        const { content, line_number } = req.body;

        // at least one field must be supplied.
        if (content === undefined && line_number === undefined) {
            res.status(400).json({message: "At least one field is required to update the comment."});
            return;
        }

        // validate content if supplied.
        if (content !== undefined && !content) {
            res.status(400).json({message: "Comment content cannot be empty."});
            return;
        }

        // validate line number if supplied.
        if (line_number !== undefined && line_number !== null && (!Number.isInteger(Number(line_number)) || Number(line_number) <= 0)) {
            res.status(400).json({message: "Line number must be a positive integer."});
            return;
        }

        // update only a comment owned by the authenticated reviewer.
        const result = await pool.query(`UPDATE comments SET content = COALESCE($1, content), line_number = COALESCE($2, line_number), updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND user_id = $4 RETURNING id, submission_id, user_id, content, line_number, created_at, updated_at`, 
            [content, line_number !== undefined? Number(line_number): null, commentId, req.user.userId]);

        if (result.rows.length === 0) {
            res.status(404).json({message: "Comment not found."});
            return;
        }

        res.status(200).json({message: "Comment updated successfully.", comment: result.rows[0]});
    } catch (error) {
        console.error("Update comment error:", error);
        res.status(500).json({message: "An error occurred while updating the comment."});
    }
};

// delete a comment.
 export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // only reviewers can manage comments.
        if (req.user.role !== "reviewer") {
            res.status(403).json({message: "Only reviewers can delete comments."});
            return;
        }

        const commentId = Number(req.params.id);

        // validate the comment ID.
        if (isNaN(commentId)) {
            res.status(400).json({message: "Invalid comment ID."});
            return;
        }

        // delete only a comment owned by the authenticated reviewer.
        const result = await pool.query(`DELETE FROM comments
            WHERE id = $1 AND user_id = $2 RETURNING id`, [commentId, req.user.userId]);

        if (result.rows.length === 0) {
            res.status(404).json({message: "Comment not found."});
            return;
        }

        res.status(200).json({message: "Comment deleted successfully."});
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({message: "An error occurred while deleting the comment."});
    }
};