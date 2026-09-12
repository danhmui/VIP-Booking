import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createRole, findRoleByName } from '../models/role.model.js';
import {
  createUser,
  findPublicUserById,
  findUserByEmail,
  findUserWithRoleByEmail,
} from '../models/user.model.js';

const SALT_ROUNDS = 10;
const DEFAULT_ROLE_NAME = 'customer';

const toPublicUser = (user) => ({
  id: user.user_id.toString(),
  email: user.email,
  fullName: user.full_name,
  phone: user.phone,
  status: user.status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  role: user.role
    ? {
        id: user.role.role_id.toString(),
        name: user.role.role_name,
        description: user.role.description,
      }
    : null,
});

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: user.user_id.toString(),
      email: user.email,
      role: user.role?.role_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
};

const getOrCreateCustomerRole = async () => {
  const existingRole = await findRoleByName(DEFAULT_ROLE_NAME);

  if (existingRole) {
    return existingRole;
  }

  return createRole({
    role_name: DEFAULT_ROLE_NAME,
    description: 'Khách hàng',
  });
};

export const registerUser = async ({ email, password, fullName, phone }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('Email đã được đăng ký');
    error.statusCode = 409;
    throw error;
  }

  const role = await getOrCreateCustomerRole();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await createUser({
    email: normalizedEmail,
    password_hash: passwordHash,
    full_name: fullName.trim(),
    phone: phone?.trim() || null,
    status: 'active',
    role_id: role.role_id,
  });

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserWithRoleByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('Tài khoản hiện không được phép đăng nhập');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: toPublicUser(user),
    token: signToken(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findPublicUserById(userId);

  if (!user) {
    const error = new Error('Không tìm thấy tài khoản');
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
};

export const verifyAuthToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};
