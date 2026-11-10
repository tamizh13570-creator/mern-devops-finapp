require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finapp',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  uploadDir: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  otpExpiry: 5 * 60 * 1000, // 5 minutes in ms
  defaultCurrency: 'INR',
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
};

module.exports = config;
