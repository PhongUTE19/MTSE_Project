import { ZodError } from "zod";

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = {};
        for (const issue of error.issues) {
          errors[issue.path.join(".")] = issue.message;
        }
        return res.status(400).json({
          error: "ValidationError",
          message: "Invalid payload.",
          errors,
        });
      }
      next(error);
    }
  };
}
