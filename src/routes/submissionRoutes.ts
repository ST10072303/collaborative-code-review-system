import { Router } from "express";
import { createSubmission, deleteSubmission, getSubmissionById, getSubmissions, updateSubmission } from "../controllers/submissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateId } from "../middleware/validationMiddleware";

const router = Router();

// POST /api/submissions
router.post("/", authenticateToken, createSubmission);

// GET /api/submissions
router.get("/", authenticateToken, getSubmissions);

// GET /api/submissions/:id, get a single submission.
router.get("/:id", authenticateToken, validateId, getSubmissionById);

// PUT /api/submissions/:id, update a submission.
router.put("/:id", authenticateToken, validateId, updateSubmission);

// DELETE /api/submissions/:id, delete a submission.
 router.delete("/:id", authenticateToken, deleteSubmission);

export default router;