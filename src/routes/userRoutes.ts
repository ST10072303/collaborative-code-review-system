import { Router } from "express";
import { deleteUser, getUserById, updateUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// GET /api/users/:id get user
router.get("/:id", authenticateToken, getUserById);

// PUT /api/users/:id Update user
router.put("/:id", authenticateToken, updateUser);
export default router;

// DELETE /api/users/:id Delete user
router.delete("/:id", authenticateToken, deleteUser);