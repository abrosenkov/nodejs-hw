import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import createHttpError from 'http-errors';

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'If this email exists, a reset link has been sent',
    });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');

  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  console.log('FRONTEND_DOMAIN:', process.env.FRONTEND_DOMAIN);

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await User.updateOne({ _id: user._id }, { password: hashPassword });

  await Session.deleteMany({
    userId: user._id,
  });

  res.status(200).json({
    message: 'Password reset successfully. Please log in again.',
  });
};
