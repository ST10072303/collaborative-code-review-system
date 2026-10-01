import { Request, Response } from "express";
import pool from "../config/db";

// create code submission.
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
        // check that the project exists.
        const projectResult = await pool.query(`SELECT id
            FROM projects WHERE id = $1`, [projectIdNumber]);

        if (projectResult.rows.length === 0) {
            res.status(404).json({ message: "Project not found." });
            return;
        }

        // check whether the user has access to the project.
        const accessResult = await pool.query(`SELECT p.id
            FROM projects p LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`, [projectIdNumber, submittedBy]);

        if (accessResult.rows.length === 0) {
            res.status(403).json({ message: "You do not have access to this project." });
            return;
        }

        // create the submission.
        const result = await pool.query(`INSERT INTO submissions (project_id, submitted_by, title, code, language)
            VALUES ($1, $2, $3, $4, $5) RETURNING id, project_id, submitted_by, title, code, language, status, created_at, updated_at`,
            [projectIdNumber, submittedBy, title, code, language]);

        res.status(201).json({ message: "Submission created successfully.", submission: result.rows[0] });
    } catch (error) {
        console.error("Create submission error:", error);
        res.status(500).json({ message: "An error occurred while creating the submission." });
    }
};

// get submissions that the authenticated user can access.
export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        // Make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }
        // get the authenticated user's ID from the JWT.
        const userId = req.user.userId;

        // retrieve submissions from projects the user can access.
        const result = await pool.query(`SELECT DISTINCT s.id, s.project_id, s.submitted_by, s.title, s.code, s.language, s.status, s.created_at, s.updated_at
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.created_by = $1 OR pm.user_id = $1 ORDER BY s.created_at DESC`,[userId]);

        res.status(200).json({submissions: result.rows});
    } catch (error) {
        console.error("Get submissions error:", error);
        res.status(500).json({message: "An error occurred while retrieving submissions."});
    }
};

// get a single submission by ID.
 export const getSubmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // Get the submission ID from the URL.
        const submissionId = Number(req.params.id);

        // validate the submission ID.
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // find the submission and check whether the authenticated user has access to its project.
        const result = await pool.query(`SELECT DISTINCT s.id, s.project_id, s.submitted_by, s.title, s.code, s.language,
                s.status, s.created_at, s.updated_at
            FROM submissions s INNER JOIN projects p ON s.project_id = p.id LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE s.id = $1AND (p.created_by = $2 OR pm.user_id = $2)`, [submissionId, req.user.userId]);

        // submission either does not exist or the user does not have access to it.
        if (result.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }
        res.status(200).json({submission: result.rows[0]});
    } catch (error) {
        console.error("Get submission error:", error);
        res.status(500).json({message: "An error occurred while retrieving the submission."});
    }
};

// Update a code submission.
 export const updateSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // get the submission ID from the URL.
        const submissionId = Number(req.params.id);

        // validate the submission ID.
        if (isNaN(submissionId)) {
            res.status(400).json({message: "Invalid submission ID."});
            return;
        }

        // get the fields that can be updated.
        const {title, code, language} = req.body;

        // one field must be supplied.
        if (title === undefined && code === undefined && language === undefined) {
            res.status(400).json({message: "At least one field is required to update the submission."});
            return;
        }

        // make sure a submission belongs to the authenticated user.
        const ownershipResult = await pool.query(`SELECT id
            FROM submissions WHERE id = $1 AND submitted_by = $2`,
            [submissionId, req.user.userId]);

        if (ownershipResult.rows.length === 0) {
            res.status(404).json({message: "Submission not found."});
            return;
        }

        // update the submission.
                const result = await pool.query(`UPDATE submissions SET title = COALESCE($1, title), code = COALESCE($2, code), 
            language = COALESCE($3, language), updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND submitted_by = $5 RETURNING id, project_id, submitted_by, title, code, language, status, created_at, updated_at`,
            [title, code, language, submissionId, req.user.userId]);

        res.status(200).json({message: "Submission updated successfully.", submission: result.rows[0]});
    } catch (error) {
        console.error("Update submission error:", error);
        res.status(500).json({message: "An error occurred while updating the submission."});
    }
};