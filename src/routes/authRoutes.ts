import { Router } from "express";
import { registerUser } from "../controllers/authController";

// Create a router for authentication-related endpoints.
const router = Router();

// POST /api/auth/register
router.post("/register", registerUser);

export default router;