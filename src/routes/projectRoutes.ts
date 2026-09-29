import { Router } from "express";
import { createProject, getProjects } from "../controllers/projectController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/projects Create project
router.post("/", authenticateToken, createProject);

// GET /api/projects
router.get("/", authenticateToken, getProjects);

export default router;