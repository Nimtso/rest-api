import type { Request, Response, NextFunction } from "express";

import logger from "../utils/logger";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error.message);
  res.status(error.status).json({
    status: error.name,
    statusCode: error.status,
    message: error.message,
  });
};

export default errorHandler;
