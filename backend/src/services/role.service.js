import {
  createRoleRecord,
  deleteRoleRecord,
  findRoleById,
  findRoles,
  updateRoleRecord,
} from '../models/roleCrud.model.js';
import { findRoleByName } from '../models/role.model.js';
import { createHttpError } from '../utils/response.js';

const systemRoleNames = ['admin', 'customer'];

const ensureSupportedRoleName = (roleName) => {
  if (roleName && !systemRoleNames.includes(roleName)) {
    throw createHttpError(400, 'He thong chi ho tro vai tro admin hoac customer');
  }
};

export const listRoles = () => {
  return findRoles();
};

export const getRole = async (roleId) => {
  const role = await findRoleById(roleId);

  if (!role) {
    throw createHttpError(404, 'Khong tim thay vai tro');
  }

  return role;
};

export const addRole = async (payload) => {
  ensureSupportedRoleName(payload.role_name);

  const existingRole = await findRoleByName(payload.role_name);

  if (existingRole) {
    throw createHttpError(409, 'Vai tro da ton tai');
  }

  return createRoleRecord(payload);
};

export const editRole = async (roleId, payload) => {
  ensureSupportedRoleName(payload.role_name);
  await getRole(roleId);

  if (payload.role_name) {
    const existingRole = await findRoleByName(payload.role_name);

    if (existingRole && existingRole.role_id !== BigInt(roleId)) {
      throw createHttpError(409, 'Vai tro da ton tai');
    }
  }

  return updateRoleRecord(roleId, payload);
};

export const removeRole = async (roleId) => {
  const role = await getRole(roleId);

  if (systemRoleNames.includes(role.role_name)) {
    throw createHttpError(409, 'Khong the xoa vai tro mac dinh cua he thong');
  }

  if (role._count.users > 0) {
    throw createHttpError(409, 'Khong the xoa vai tro dang co nguoi dung');
  }

  await deleteRoleRecord(roleId);
};
