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
          message: 'Account pending verification. A new OTP has been sent to your email.',
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

    return { user: user.toPublicJSON() };
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

    if (user.isDemo) {
      const error = new Error('Action restricted: Password changes are disabled in Demo Mode.');
      error.statusCode = 403;
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

  async demoLogin() {
    const demoEmail = 'demo@finapp.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('DemoPass@123', salt);
      user = await User.create({
        name: 'Demo Guest',
        email: demoEmail,
        password: hashedPassword,
        phone: '9876543210',
        currency: 'INR',
        isVerified: true,
        isDemo: true,
        role: 'demo',
        lastLogin: new Date(),
      });
    } else {
      user.isDemo = true;
      user.role = 'demo';
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    // Seed realistic sample records if demo account has no data yet
    await this.seedDemoDataIfEmpty(user._id);

    const token = generateToken(user._id);
    return { token, user: user.toPublicJSON() };
  }

  async seedDemoDataIfEmpty(userId) {
    try {
      const Expense = require('../expenses/expense.model');
      const Income = require('../income/income.model');
      const Budget = require('../budgets/budget.model');
      const Category = require('../categories/category.model');
      const { getCurrentMonthYear, toSmallestUnit } = require('../../utils/helpers');

      const expenseCount = await Expense.countDocuments({ userId });
      if (expenseCount > 0) return;

      const monthYear = getCurrentMonthYear();
      const categories = await Category.find({ isDefault: true });
      const catMap = {};
      categories.forEach((c) => {
        catMap[c.name] = c._id;
      });

      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();

      // Seed 2 Income entries
      await Income.create([
        {
          userId,
          amount: toSmallestUnit(75000),
          source: 'Salary',
          date: new Date(y, m, 1),
          note: 'Monthly Corporate Salary',
          paymentMethod: 'bank_transfer',
        },
        {
          userId,
          amount: toSmallestUnit(12000),
          source: 'Freelance',
          date: new Date(y, m, 10),
          note: 'UI Design Freelance Project',
          paymentMethod: 'upi',
        },
      ]);

      // Seed 6 realistic Expenses
      await Expense.create([
        {
          userId,
          amount: toSmallestUnit(22000),
          category: catMap['Rent & Housing'] || categories[0]?._id,
          date: new Date(y, m, 2),
          note: 'Apartment Monthly Rent',
          paymentMethod: 'netbanking',
          tags: ['home', 'rent'],
        },
        {
          userId,
          amount: toSmallestUnit(4500),
          category: catMap['Food & Dining'] || categories[0]?._id,
          date: new Date(y, m, 4),
          note: 'Supermarket Grocery Haul',
          paymentMethod: 'upi',
          tags: ['groceries', 'food'],
        },
        {
          userId,
          amount: toSmallestUnit(1850),
          category: catMap['Food & Dining'] || categories[0]?._id,
          date: new Date(y, m, 8),
          note: 'Weekend Dining with Friends',
          paymentMethod: 'card',
          tags: ['dining', 'friends'],
        },
        {
          userId,
          amount: toSmallestUnit(2400),
          category: catMap['Utilities'] || categories[0]?._id,
          date: new Date(y, m, 6),
          note: 'Electricity & Wifi Bill',
          paymentMethod: 'upi',
          tags: ['bills'],
        },
        {
          userId,
          amount: toSmallestUnit(1500),
          category: catMap['Transport'] || categories[0]?._id,
          date: new Date(y, m, 9),
          note: 'Fuel & Cab Rides',
          paymentMethod: 'cash',
          tags: ['commute'],
        },
        {
          userId,
          amount: toSmallestUnit(1299),
          category: catMap['Entertainment'] || categories[0]?._id,
          date: new Date(y, m, 12),
          note: 'Netflix & Spotify Subscriptions',
          paymentMethod: 'card',
          tags: ['subscription'],
        },
      ]);

      // Seed 2 Budgets
      if (catMap['Food & Dining']) {
        await Budget.create({
          userId,
          category: catMap['Food & Dining'],
          monthYear,
          amount: toSmallestUnit(10000),
          alertAt: 80,
        });
      }
      if (catMap['Rent & Housing']) {
        await Budget.create({
          userId,
          category: catMap['Rent & Housing'],
          monthYear,
          amount: toSmallestUnit(25000),
          alertAt: 90,
        });
      }
    } catch (err) {
      console.warn('Demo seeding error (non-fatal):', err.message);
    }
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
    };
  }

  getActiveOTP(email) {
    const normalizedEmail = String(email || '').toLowerCase().trim();
    return getActiveOTP(normalizedEmail);
  }
}

module.exports = new AuthService();
