import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    const errors = err.issues.map((e: ZodIssue) => ({ path: e.path.join('.'), message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation Error', data: errors });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return sendError(res, 'Duplicate field value entered', 400);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Resource not found', 404);
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error';

  return sendError(res, message, statusCode);
};
