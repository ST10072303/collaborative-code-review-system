import { Router } from "express";
import { getUserStats } from "../controllers/statsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// get statistics for the authenticated user.
router.get("/stats", authenticateToken, getUserStats);

export default router;