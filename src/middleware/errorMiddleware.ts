import { Request, Response, NextFunction } from "express";

// global error-handling middleware.
// this middleware catches unexpected errors that are passed to Express and returns a consistent JSON response.
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error("Unhandled application error:", error);

    // if Express has already started sending the response, pass the error to Express's default error handler.
    if (res.headersSent) {
        next(error);
        return;
    }
    res.status(500).json({message: "An unexpected server error occurred."});
};