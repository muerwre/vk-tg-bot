import { Request, Response } from "express";
import { NextFunction } from "connect";
import logger from "../../service/logger";

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn(`http error`, err);
  logger.debug(`http error`, req, err);

  if (res.headersSent) {
    return next(err);
  }

  res.sendStatus(501);
};
