import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = authSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const validateAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = req.path.includes("register") ? registerSchema : authSchema;
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
