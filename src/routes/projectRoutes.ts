import { Router } from "express";
import { createProject } from "../controllers/projectController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/projects Create project
router.post("/", authenticateToken, createProject);

export default router;