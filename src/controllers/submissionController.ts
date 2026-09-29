import { Request, Response } from "express";
import pool from "../config/db";

// Create code submission.
export const createSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({ message: "Authentication required." });
            return;
        }

        // get submission details from the request body.
        const { projectId, title, code, language } = req.body;

        // validate the project ID.
        if (!projectId || isNaN(Number(projectId))) {
            res.status(400).json({ message: "A valid project ID is required." });
            return;
        }

        // validate the required submission fields.
        if (!title || !code || !language) {
            res.status(400).json({ message: "Title, code, and language are required." });
            return;
        }

        const projectIdNumber = Number(projectId);
        const submittedBy = req.user.userId;

        // Check that the project exists.
        const projectResult = await pool.query(`SELECT id
            FROM projects WHERE id = $1`, [projectIdNumber]);

        if (projectResult.rows.length === 0) {
            res.status(404).json({ message: "Project not found." });
            return;
        }

        // Check whether the user has access to the project.
        const accessResult = await pool.query(`SELECT p.id
            FROM projects p LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [projectIdNumber, submittedBy]);

        if (accessResult.rows.length === 0) {
            res.status(403).json({ message: "You do not have access to this project." });
            return;
        }

        // Create the submission.
        const result = await pool.query(`INSERT INTO submissions (project_id, submitted_by, title, code, language)
            VALUES ($1, $2, $3, $4, $5) RETURNING id, project_id, submitted_by, title, code, language, status, created_at, updated_at`,
            [projectIdNumber, submittedBy, title, code, language]);

        res.status(201).json({ message: "Submission created successfully.", submission: result.rows[0] });
    } catch (error) {
        console.error("Create submission error:", error);
        res.status(500).json({ message: "An error occurred while creating the submission." });
    }
};