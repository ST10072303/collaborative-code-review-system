import { Router } from "express";
import { approveSubmission, requestChanges } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// PATCH /api/submissions/:id/approve, approve a submission.
router.patch("/submissions/:id/approve", authenticateToken, approveSubmission);
// PATCH /api/submissions/:id/request-changes, request changes to a submission
router.patch("/submissions/:id/request-changes", authenticateToken, requestChanges);

export default router;