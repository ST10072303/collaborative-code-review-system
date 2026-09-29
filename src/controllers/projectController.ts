import { Request, Response } from "express";
import pool from "../config/db";

// Create a new project.
export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        // ensure user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // get project details from the request body.
        const {name, description, repository_url} = req.body;

        // project name is required.
        if (!name) {
            res.status(400).json({message: "Project name is required."});
            return;
        }

        // the creator comes from the JWT.
        const createdBy = req.user.userId;

        // insert the project into PostgreSQL.
        const result = await pool.query(`INSERT INTO projects (name, description, repository_url, created_by)
            VALUES ($1, $2, $3, $4) RETURNING id, name, description, repository_url, created_by, created_at`,
            [name, description || null, repository_url || null, createdBy]
        );

        res.status(201).json({message: "Project created successfully.", project: result.rows[0]});
    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({message: "An error occurred while creating the project."});
    }
};