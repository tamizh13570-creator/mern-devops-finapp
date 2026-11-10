const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../modules/auth/auth.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await User.findById(decoded.id).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Account not verified. Please verify your email.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.id).select('-password -otp -otpExpiry');
        if (user) req.user = user;
      } catch (_) {
        // Token invalid – proceed without user
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate, optionalAuth };
