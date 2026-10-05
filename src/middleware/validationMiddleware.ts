import { Request, Response, NextFunction } from "express";

// validate that a route parameter is a valid positive integer.
 export const validateId = (req: Request, res: Response, next: NextFunction): void => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({message: "ID must be a positive integer."});
        return;
    }
    next();
};

// validate a route parameter as a positive number.
export const validateParamId = (parameterName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = Number(req.params[parameterName]);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({message: `${parameterName} must be a positive integer.`});
            return;
        }
        next();
    };
};

// validate that a value is a non-empty string.
export const validateRequiredText = (value: unknown, fieldName: string, res: Response): boolean => {
    if (typeof value !== "string" || value.trim() === "") {
        res.status(400).json({message: `${fieldName} is required.`
        });
        return false;
    }
    return true;
};

// validate an email address.
export const validateEmail = (email: unknown, res: Response): boolean => {
    if (typeof email !== "string") {
        res.status(400).json({message: "Email is required."});
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
        res.status(400).json({message: "Please provide a valid email address."});
        return false;
    }
    return true;
};

// validate a user's role.
export const validateRole = (role: unknown, res: Response): boolean => {
    if (role !== "submitter" && role !== "reviewer") {
        res.status(400).json({message: "Role must be either submitter or reviewer."});
        return false;
    }
    return true;
};