import { Router } from "express";
import { getUserById } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// GET /api/users/:id
router.get("/:id", authenticateToken, getUserById);

export default router;