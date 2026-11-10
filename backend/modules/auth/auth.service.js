const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./auth.model');
const { sendOTPEmail, sendPasswordResetEmail } = require('../../utils/emailService');
const { generateOTP, storeOTP, verifyOTP, getActiveOTP } = require('../../utils/otpService');
const config = require('../../config/config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expire });
};

class AuthService {
  async register({ name, email, phone, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (!existing.isVerified) {
        // User registered earlier but never verified. Update info and issue a brand new OTP.
        existing.name = name;
        if (phone) existing.phone = phone;
        existing.password = password; // pre-save hook will hash password

        const otp = generateOTP();
        existing.otp = otp;
        existing.otpExpiry = new Date(Date.now() + config.otpExpiry);
        await existing.save();

        storeOTP(normalizedEmail, otp);
        await sendOTPEmail(normalizedEmail, name, otp);

        return {
          user: existing.toPublicJSON(),
          otp,
          message: 'Account pending verification. A new OTP has been generated.',
        };
      }

      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Fresh registration: generate a new random OTP
    const otp = generateOTP();
    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      password,
      otp,
      otpExpiry: new Date(Date.now() + config.otpExpiry),
    });
    await user.save();

    storeOTP(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, name, otp);

    return { user: user.toPublicJSON(), otp };
  }

  async verifyOTPAndActivate({ email, otp }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiry');
    if (!user) {
      const error = new Error('No account found with this email.');
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) {
      const error = new Error('Account is already verified.');
      error.statusCode = 400;
      throw error;
    }

    // Verify against current in-memory store or stored user record
    let result = verifyOTP(normalizedEmail, otp);
    if (!result.valid && user.otp) {
      const cleanInput = String(otp).trim();
      const isDbMatch = user.otp === cleanInput && (!user.otpExpiry || new Date() <= user.otpExpiry);
      if (isDbMatch) {
        result = { valid: true };
      }
    }

    if (!result.valid) {
      const error = new Error(result.reason || 'Invalid or expired OTP.');
      error.statusCode = 400;
      throw error;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    return { token, user: user.toPublicJSON() };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.password) {
      const error = new Error('This account uses Google login. Please sign in with Google.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isVerified) {
      const error = new Error('Please verify your email before logging in.');
      error.statusCode = 403;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    return { token, user: user.toPublicJSON() };
  }

  async googleLogin({ googleId, email, name, avatar }) {
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.lastLogin = new Date();
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        avatar,
        isVerified: true,
        lastLogin: new Date(),
      });
    }

    const token = generateToken(user._id);
    return { token, user: user.toPublicJSON() };
  }

  async forgotPassword({ email }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If this email is registered, you will receive a reset OTP.' };
    }

    const otp = generateOTP();
    storeOTP(`reset_${normalizedEmail}`, otp);
    await sendPasswordResetEmail(normalizedEmail, user.name, otp);

    return {
      message: 'Password reset OTP has been sent to your email.',
      otp,
    };
  }

  async resetPassword({ email, otp, newPassword }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error('No account found with this email.');
      error.statusCode = 404;
      throw error;
    }

    const result = verifyOTP(`reset_${normalizedEmail}`, otp);
    if (!result.valid) {
      const error = new Error(result.reason);
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password reset successfully. You can now log in.' };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user.toPublicJSON();
  }

  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'phone', 'currency', 'avatar'];
    const filteredUpdates = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
    });

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true, runValidators: true });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user.toPublicJSON();
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (!user.password) {
      const error = new Error('Password change not supported for Google accounts.');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect.');
      error.statusCode = 401;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully.' };
  }

  async resendOTP({ email }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error('No account found with this email.');
      error.statusCode = 404;
      throw error;
    }

    if (user.isVerified) {
      const error = new Error('Account is already verified.');
      error.statusCode = 400;
      throw error;
    }

    // Generate a fresh OTP every time requested (multiple generations supported)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + config.otpExpiry);
    await user.save({ validateBeforeSave: false });

    storeOTP(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, user.name, otp);

    return {
      message: 'A new OTP has been generated and sent to your email.',
      otp,
    };
  }

  getActiveOTP(email) {
    const normalizedEmail = String(email || '').toLowerCase().trim();
    return getActiveOTP(normalizedEmail);
  }
}

module.exports = new AuthService();
