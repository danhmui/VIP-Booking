import { z } from 'zod';
import {
  addUser,
  editUser,
  getUser,
  listUsers,
  removeUser,
} from '../services/user.service.js';
import { createHttpError, handleControllerError, sendSuccess } from '../utils/response.js';

const idSchema = z.string().regex(/^\d+$/, 'ID không hợp lệ');
const userStatusSchema = z.enum(['active', 'inactive', 'locked']);
const managerRoles = ['admin'];

const userSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().trim().optional().nullable(),
  status: userStatusSchema.default('active'),
  role_id: idSchema,
});

const updateUserSchema = userSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  });

const querySchema = z.object({
  search: z.string().trim().optional(),
  status: userStatusSchema.optional(),
  roleId: idSchema.optional(),
});

const ensureCanAccessUser = (req, userId) => {
  if (managerRoles.includes(req.user.role) || req.user.id === userId) {
    return;
  }

  throw createHttpError(403, 'Bạn không có quyền truy cập người dùng này');
};

export const index = async (req, res) => {
  try {
    const users = await listUsers(querySchema.parse(req.query));
    return sendSuccess(res, { data: { users } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const show = async (req, res) => {
  try {
    const userId = idSchema.parse(req.params.id);
    ensureCanAccessUser(req, userId);
    return sendSuccess(res, { data: { user: await getUser(userId) } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const store = async (req, res) => {
  try {
    const user = await addUser(userSchema.parse(req.body));
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Tạo người dùng thành công',
      data: { user },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const userId = idSchema.parse(req.params.id);
    ensureCanAccessUser(req, userId);
    const payload = updateUserSchema.parse(req.body);

    if (!managerRoles.includes(req.user.role)) {
      delete payload.status;
      delete payload.role_id;
    }

    const user = await editUser(userId, payload);
    return sendSuccess(res, {
      message: 'Cập nhật người dùng thành công',
      data: { user },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    await removeUser(idSchema.parse(req.params.id));
    return sendSuccess(res, { message: 'Xóa người dùng thành công' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
