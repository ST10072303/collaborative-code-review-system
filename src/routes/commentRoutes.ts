import { Router } from "express";
import {updateComment, deleteComment} from "../controllers/commentController";
import { authenticateToken } from "../middleware/authMiddleware";
import {createComment, getComments} from "../controllers/commentController";
import { validateParamId } from "../middleware/validationMiddleware";

const router = Router();

//  POST /api/submissions/, create a comment on a submission.
router.post("/submissions/:submissionId/comments", authenticateToken, createComment);

// GET /api/submissions/, get comments.
router.get("/submissions/:submissionId/comments", authenticateToken, validateParamId("submissionId"), getComments);

// PUT /api/comments/, update a comment.
 router.put("/comments/:id", authenticateToken, validateParamId("submissionId"), updateComment);

// DELETE /api/comments/, delete a comment.
router.delete("/comments/:id", authenticateToken, deleteComment);

export default router;