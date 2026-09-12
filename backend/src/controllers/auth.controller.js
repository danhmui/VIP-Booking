import { z } from 'zod';
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/auth.service.js';
import { handleControllerError, sendSuccess } from '../utils/response.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true' || Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().trim().min(8, 'Số điện thoại không hợp lệ').optional(),
});

const loginSchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const register = async (req, res) => {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Đăng ký tài khoản thành công',
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);

    return sendSuccess(res, {
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const me = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);

    return sendSuccess(res, {
      data: { user },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, {
    message: 'Đăng xuất thành công',
  });
};

const forgotPasswordSchema = z.object({
  email : z.string().email('Email không hợp lệ')
})

const resetPasswordSchema = z.object({
  email : z.string().email('Email không hợp lệ'),
  code : z.string().length(6, 'Mã xác thực phải gồm đúng 6 chữ số'),
  newPassword : z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 kí tự'),
})

const verifyResetCodeSchema = resetPasswordSchema.pick({
  email: true,
  code: true,
})

const findResetCodeError = async ({ email, code }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { statusCode: 404, message: 'Nguoi dung khong ton tai' };
  }

  if (!user.reset_code || user.reset_code !== code) {
    return { statusCode: 400, message: 'Ma xac thuc khong chinh xac' };
  }

  if (!user.reset_code_expires || new Date() > new Date(user.reset_code_expires)) {
    return { statusCode: 400, message: 'Ma xac thuc da het han, vui long lay ma moi' };
  }

  return null;
}

export const forgotPassword = async(req, res) => {
  try{
    const payload = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where : { email : payload.email }});
    
    if(!user){
      return res.status(400).json({success: false, message: "Email này không tồn tại "});
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: {email: payload.email},
      data:{
        reset_code: resetCode,
        reset_code_expires: expires
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"VIP Hotel Booking" <no-reply@hotel.com>',
      to: payload.email,
      subject: '🔑 Mã xác thực khôi phục mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px; margin: 0 auto;">
          <h2 style="color: #1a73e8; text-align: center;">Yêu cầu thay đổi mật khẩu</h2>
          <p>Chào bạn,</p>
          <p>Mã xác thực để đặt lại mật khẩu cho tài khoản của bạn là:</p>
          <div style="font-size: 32px; font-weight: bold; color: #1a73e8; background: #f1f3f4; padding: 15px; text-align: center; letter-spacing: 6px; margin: 20px 0; border-radius: 4px;">
            ${resetCode}
          </div>
          <p style="color: #d93025; font-size: 13px;">Mã này có hiệu lực trong vòng <b>5 phút</b> và chỉ sử dụng được 1 lần. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return sendSuccess(res, {
      message: 'Mã xác thực đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!',
    })

  }catch(error){
    return handleControllerError(res, error);
  }
}

export const verifyResetCode = async(req, res) =>{
  try{
    const payload  = verifyResetCodeSchema.parse(req.body);
    const resetCodeError = await findResetCodeError(payload);

    if (resetCodeError) {
      return res.status(resetCodeError.statusCode).json({
        success: false,
        message: resetCodeError.message,
      });
    }

    return sendSuccess(res, {
      message: 'Ma xac thuc hop le',
    })
    
  }catch(error){
    return handleControllerError(res, error);
  }
}

export const resetPassword = async(req, res) =>{
  try{
    const payload  = resetPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email : payload.email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    if (!user.reset_code || user.reset_code !== payload.code) {
      return res.status(400).json({ success: false, message: 'Mã xác thực không chính xác' });
    }

    if (new Date() > new Date(user.reset_code_expires)) {
      return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn, vui lòng lấy mã mới' });
    }
    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await prisma.user.update({
      where: { email: payload.email },
      data: {
        password_hash: hashedPassword,
        reset_code: null,
        reset_code_expires: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập.'
    })
    
  }catch(error){
    return handleControllerError(res, error);
  }
}

