import { Router } from "express";
import {getNotifications, markNotificationAsRead} from "../controllers/notificationController";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateId } from "../middleware/validationMiddleware";

const router = Router();

// Get notifications belonging to the logged-in user.
router.get("/notifications", authenticateToken, getNotifications);

// Mark one notification as read.
router.patch("/notifications/:id/read", authenticateToken, validateId, markNotificationAsRead);

export default router;