import { Router } from "express";
import { approveSubmission } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// PATCH /api/submissions/:id/approve, approve a submission.
 
router.patch("/submissions/:id/approve", authenticateToken, approveSubmission);

export default router;