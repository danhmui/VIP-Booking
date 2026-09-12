import { z } from 'zod';
import {
  addRole,
  editRole,
  getRole,
  listRoles,
  removeRole,
} from '../services/role.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID khong hop le');
const roleNameSchema = z.enum(['admin', 'customer'], {
  message: 'He thong chi ho tro vai tro admin hoac customer',
});
const roleSchema = z.object({
  role_name: roleNameSchema,
  description: z.string().trim().optional().nullable(),
});
const updateRoleSchema = roleSchema.partial();

export const index = async (req, res) => {
  try {
    return sendSuccess(res, { data: { roles: await listRoles() } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const role = await getRole(idSchema.parse(req.params.id));
    return sendSuccess(res, { data: { role } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const role = await addRole(roleSchema.parse(req.body));
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tao vai tro thanh cong',
      data: { role },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const role = await editRole(idSchema.parse(req.params.id), updateRoleSchema.parse(req.body));
    return sendSuccess(res, {
      message: 'Cap nhat vai tro thanh cong',
      data: { role },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeRole(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xoa vai tro thanh cong' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
