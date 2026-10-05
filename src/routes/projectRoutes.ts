import { Router } from "express";
import { addProjectMember, createProject, getProjects, removeProjectMember } from "../controllers/projectController";
import { authenticateToken } from "../middleware/authMiddleware";
import { validateId } from "../middleware/validationMiddleware";

const router = Router();

// POST /api/projects, Create project
router.post("/", authenticateToken, createProject);

// GET /api/projects, get prjects
router.get("/", authenticateToken, getProjects);

// POST /api/projects/:projectId/members, add a user to a project.
router.post("/:projectId/members", authenticateToken, validateId, addProjectMember);

// DELETE /api/projects/:projectId/members/:userId, Remove a user from a project.
router.delete("/:projectId/members/:userId", authenticateToken, removeProjectMember);

export default router;