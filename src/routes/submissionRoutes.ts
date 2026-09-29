import { Router } from "express";
import { createSubmission } from "../controllers/submissionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/submissions
 router.post("/", authenticateToken, createSubmission);

export default router;