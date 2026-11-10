const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const { avatarUpload } = require('../../middleware/upload');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase letter and one number'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
];

const verifyOTPValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/verify-otp', verifyOTPValidation, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.get('/active-otp', authController.getActiveOTP);
router.post('/login', loginValidation, authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, avatarUpload.single('avatar'), authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, authController.changePassword);

module.exports = router;
