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
      message: result.message || 'Registration successful. Please check your email for the OTP.',
      data: { user: result.user },
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

const demoLogin = async (req, res, next) => {
  try {
    const result = await authService.demoLogin();
    res.status(200).json({
      success: true,
      message: 'Demo login successful. Welcome to FinApp in Demo Mode!',
      data: result,
    });
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
      message: result.message || 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  googleLogin,
  demoLogin,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  resendOTP,
};
