import { Router } from "express";
import { deleteUser, getUserById, updateUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateId } from "../middleware/validationMiddleware";

const router = Router();

// GET /api/users/:id get user
router.get("/:id", authenticateToken, validateId, getUserById);

// PUT /api/users/:id Update user
router.put("/:id", authenticateToken, validateId, updateUser);
export default router;

// DELETE /api/users/:id Delete user
router.delete("/:id", authenticateToken, validateId, deleteUser);