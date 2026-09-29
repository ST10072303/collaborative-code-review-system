import { Request, Response, NextFunction } from "express";

// middleware that checks whether the authenticated user has a role
 export const requireRole = (requiredRole: "submitter" | "reviewer") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // authenticateToken should have already added req.user.
        if (!req.user) {
            res.status(401).json({message: "Authentication required."});
            return;
        }

        // check whether the logged-in user's role matches the role required by this route.
        if (req.user.role !== requiredRole) {
            res.status(403).json({message: "You do not have permission to access this resource."});
            return;
        }
        // user has the correct role continue.
        next();
    };
};