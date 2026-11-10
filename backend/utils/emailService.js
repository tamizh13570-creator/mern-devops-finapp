const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: {
      rejectUnauthorized: config.nodeEnv === 'production',
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!config.email.user || !config.email.pass) {
    console.warn('Email credentials not configured. Skipping email send.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"FinApp" <${config.email.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (to, name, otp) => {
  const subject = 'FinApp - Email Verification OTP';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px; }
        .otp-box { background: #f8f9ff; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>FinApp</h1></div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your email verification OTP is:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} FinApp. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;
  const text = `Hi ${name}, your FinApp OTP is: ${otp}. It expires in 5 minutes.`;
  return sendEmail({ to, subject, html, text });
};

const sendPasswordResetEmail = async (to, name, otp) => {
  const subject = 'FinApp - Password Reset OTP';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px; }
        .otp-box { background: #fff5f5; border: 2px dashed #f5576c; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>FinApp</h1></div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your password reset OTP is:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
          <p>If you did not request a password reset, please secure your account immediately.</p>
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} FinApp. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;
  const text = `Hi ${name}, your FinApp password reset OTP is: ${otp}. It expires in 5 minutes.`;
  return sendEmail({ to, subject, html, text });
};

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail };
