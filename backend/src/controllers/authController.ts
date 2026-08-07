import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'TEACHER']),
  grade: z.string().optional(),
  learningStyle: z.string().optional(),
  department: z.string().optional(),
  qualification: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};
