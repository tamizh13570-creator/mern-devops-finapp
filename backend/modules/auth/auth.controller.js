const { validationResult } = require('express-validator');
const authService = require('./auth.service');

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

const register = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { name, email, phone, password } = req.body;
    const result = await authService.register({ name, email, phone, password });
    res.status(201).json({
      success: true,
      message: result.message || 'Registration successful. Please verify with your OTP.',
      data: result,
      otp: result.otp,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email, otp } = req.body;
    const result = await authService.verifyOTPAndActivate({ email, otp });
    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to FinApp!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'googleId and email are required.' });
    }
    const result = await authService.googleLogin({ googleId, email, name, avatar });
    res.status(200).json({ success: true, message: 'Google login successful.', data: result });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword({ email, otp, newPassword });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // If avatar file uploaded, set avatar path
    const updates = { ...req.body };
    if (req.file) {
      updates.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    const user = await authService.updateProfile(req.user._id, updates);
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, { currentPassword, newPassword });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    const result = await authService.resendOTP({ email });
    res.status(200).json({
      success: true,
      message: result.message || 'A new OTP has been generated successfully.',
      data: result,
      otp: result.otp,
    });
  } catch (error) {
    next(error);
  }
};

const getActiveOTP = async (req, res, next) => {
  try {
    const email = (req.query.email || req.body.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const otp = authService.getActiveOTP(email);
    if (!otp) {
      return res.status(404).json({ success: false, message: 'No active OTP found. Please generate a new OTP.' });
    }
    res.status(200).json({ success: true, otp });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  resendOTP,
  getActiveOTP,
};
