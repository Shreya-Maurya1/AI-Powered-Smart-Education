import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export const registerUser = async (data: any) => {
  const { email, password, name, role, grade, learningStyle, department, qualification } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { statusCode: 400, message: 'User already exists with this email' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: role as Role,
      student: role === Role.STUDENT ? {
        create: {
          grade: grade || '',
          learningStyle: learningStyle || 'visual'
        }
      } : undefined,
      teacher: role === Role.TEACHER ? {
        create: {
          department: department || '',
          qualification: qualification || ''
        }
      } : undefined
    },
    include: { student: true, teacher: true }
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true, teacher: true }
  });

  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true, teacher: true }
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
