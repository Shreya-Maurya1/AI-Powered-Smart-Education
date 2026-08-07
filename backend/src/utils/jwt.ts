import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN as any) || '7d',
  };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
};
