// Import Express so TypeScript knows we are extending its types.
import "express";

// Extend Express's Request interface.
// This allows us to use req.user in protected routes.
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: "submitter" | "reviewer";
            };
        }
    }
}

export {};