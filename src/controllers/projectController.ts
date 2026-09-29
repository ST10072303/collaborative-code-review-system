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

// get projects available to the authenticated user.
 export const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the user is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // get the authenticated user's ID from the JWT.
        const userId = req.user.userId;

        // find projects created by the user or projects where the user is a member.
        // DISTINCT makes sure each project appears only once.
        const result = await pool.query(`SELECT DISTINCT p.id, p.name, p.description, p.repository_url, p.created_by, p.created_at
            FROM projects p LEFT JOIN project_members pm ON p.id = pm.project_id
            WHERE p.created_by = $1 OR pm.user_id = $1 ORDER BY p.created_at DESC`,[userId]);

        res.status(200).json({projects: result.rows});

    } catch (error) {
        console.error("Get projects error:", error);
        res.status(500).json({message: "An error occurred while retrieving projects."});
    }
};

// add a user to a project.
export const addProjectMember = async (req: Request, res: Response): Promise<void> => {
    try {
        // make sure the requester is authenticated.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // get the project ID from the URL.
        const projectId = Number(req.params.projectId);

        // get the user ID that should be added from the request body.
        const { userId } = req.body;

        // validate the project ID.
        if (isNaN(projectId)) {
            res.status(400).json({message: "Invalid project ID."});
            return;
        }

        // validate the user ID.
        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({message: "A valid user ID is required."});
            return;
        }

        const memberUserId = Number(userId);

        // Check that the project exists and get its creator.
        const projectResult = await pool.query(`SELECT id, created_by
            FROM projects WHERE id = $1`, [projectId]);

        if (projectResult.rows.length === 0) {
            res.status(404).json({message: "Project not found."});
            return;
        }

        // only the project creator can add members.
        if (projectResult.rows[0].created_by !== req.user.userId) {
            res.status(403).json({message: "Only the project creator can add members."});
            return;
        }

        // Check that the user we want to add exists.
        const userResult = await pool.query(`SELECT id, name, email, role
            FROM users WHERE id = $1`, [memberUserId]);

        if (userResult.rows.length === 0) {
            res.status(404).json({message: "User not found."});
            return;
        }

        // Check whether the user is already a member.
        const existingMember = await pool.query(`SELECT project_id, user_id
            FROM project_members WHERE project_id = $1 AND user_id = $2 `, [projectId, memberUserId]);

        if (existingMember.rows.length > 0) {
            res.status(409).json({message: "User is already a member of this project."});
            return;
        }

        // Add the user to the project.
        await pool.query(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)`, [projectId, memberUserId]);
        res.status(201).json({message: "User added to project successfully.", member: userResult.rows[0]});
    } catch (error) {
        console.error("Add project member error:", error);
        res.status(500).json({message: "An error occurred while adding the project member."});
    }
};