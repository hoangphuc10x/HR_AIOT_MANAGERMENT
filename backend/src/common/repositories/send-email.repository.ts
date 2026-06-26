import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class EmailSend {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async sendLink(email: string, userId: number): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Access this link to reset your password',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${process.env.PORT_ACCEPT}/reset-password/${userId}">Reset Password</a>`,
    });

    this.logger.info(`Password reset link sent to ${email}`);
  }

  async sendActivationLink(email: string, userId: number): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject:
        'Use this Info to access your account and change password to active your account',
      html: `
      <h2>Activate your account</h2>
      <p>Click the link below to activate your account and set a new password:</p>
      <p>Email: <strong>${email}</strong></p>
      <p>Note: This link is valid for 24 hours.</p>
      <a href="${process.env.PORT_ACCEPT}/active-account/${userId}">Activate Account</a>`,
    });

    this.logger.info(`Activation link sent to ${email}`);
  }
}
