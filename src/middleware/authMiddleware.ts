import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// This interface describes the information that we store inside our JWT token.
interface JwtPayload {
    userId: number;
    role: "submitter" | "reviewer";
}

// Authentication middleware.
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: "Authentication token is required." });
        return;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({ message: "Invalid authorization format." });
        return;
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({ message: "JWT secret is not configured." });
        return;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid or expired authentication token." });
    }
};