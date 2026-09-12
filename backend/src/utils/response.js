import { z } from 'zod';

export const serializeValue = (value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value && typeof value === 'object' && typeof value.toFixed === 'function') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)]),
    );
  }

  return value;
};

export const sendSuccess = (res, { statusCode = 200, message, data } = {}) => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data: serializeValue(data) } : {}),
  });
};

export const handleControllerError = (res, error) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Lỗi hệ thống',
  });
};

export const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
