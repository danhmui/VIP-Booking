import bcrypt from 'bcrypt';
import { findRoleById } from '../models/roleCrud.model.js';
import { findUserByEmail } from '../models/user.model.js';
import {
  createUserRecord,
  deleteUserRecord,
  findPublicUserByIdWithRole,
  findUsers,
  updateUserRecord,
} from '../models/userCrud.model.js';
import { createHttpError } from '../utils/response.js';

const SALT_ROUNDS = 10;

const ensureRoleExists = async (roleId) => {
  const role = await findRoleById(roleId);

  if (!role) {
    throw createHttpError(400, 'Vai trò không tồn tại');
  }
};

export const listUsers = (filters) => {
  return findUsers(filters);
};

export const getUser = async (userId) => {
  const user = await findPublicUserByIdWithRole(userId);

  if (!user) {
    throw createHttpError(404, 'Không tìm thấy người dùng');
  }

  return user;
};

export const addUser = async (payload) => {
  await ensureRoleExists(payload.role_id);

  const normalizedEmail = payload.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError(409, 'Email đã tồn tại');
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  return createUserRecord({
    email: normalizedEmail,
    password_hash: passwordHash,
    full_name: payload.full_name.trim(),
    phone: payload.phone?.trim() || null,
    status: payload.status,
    role_id: BigInt(payload.role_id),
  });
};

export const editUser = async (userId, payload) => {
  await getUser(userId);

  if (payload.role_id) {
    await ensureRoleExists(payload.role_id);
  }

  const data = {
    ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
    ...(payload.full_name ? { full_name: payload.full_name.trim() } : {}),
    ...(payload.phone !== undefined ? { phone: payload.phone?.trim() || null } : {}),
    ...(payload.status ? { status: payload.status } : {}),
    ...(payload.role_id ? { role_id: BigInt(payload.role_id) } : {}),
    ...(payload.password
      ? { password_hash: await bcrypt.hash(payload.password, SALT_ROUNDS) }
      : {}),
    updated_at: new Date(),
  };

  return updateUserRecord(userId, data);
};

export const removeUser = async (userId) => {
  await getUser(userId);
  await deleteUserRecord(userId);
};
