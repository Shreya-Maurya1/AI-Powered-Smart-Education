import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden - Insufficient permissions', 403);
    }
    next();
  };
};
