const crypto = require('crypto');
const config = require('../config/config');

// In-memory OTP store: { email: { otp, expiry, attempts, generatedAt } }
// For production, use Redis or store in DB
const otpStore = new Map();

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit numeric OTP
 * @returns {string}
 */
const generateOTP = () => {
  // Generate random 6-digit number between 100000 and 999999
  const num = crypto.randomInt(100000, 1000000);
  return String(num);
};

/**
 * Store OTP for a given key (email) with expiry
 * Can be called multiple times to regenerate OTP for the same user
 * @param {string} key - Typically email address
 * @param {string} otp
 */
const storeOTP = (key, otp) => {
  const normalizedKey = String(key).toLowerCase().trim();
  const cleanOtp = String(otp).trim();
  console.log(`\n🔑 [OTP GENERATED] for ${normalizedKey}: ${cleanOtp}\n`);
  otpStore.set(normalizedKey, {
    otp: cleanOtp,
    expiry: Date.now() + config.otpExpiry,
    attempts: 0,
    generatedAt: Date.now(),
  });
  return cleanOtp;
};

/**
 * Get active (unexpired) OTP for a given key
 * @param {string} key
 * @returns {string|null}
 */
const getActiveOTP = (key) => {
  const normalizedKey = String(key).toLowerCase().trim();
  const record = otpStore.get(normalizedKey);
  if (!record) return null;
  if (Date.now() > record.expiry) {
    otpStore.delete(normalizedKey);
    return null;
  }
  return record.otp;
};

/**
 * Verify an OTP for a given key
 * @param {string} key
 * @param {string} inputOtp
 * @returns {{ valid: boolean, reason?: string }}
 */
const verifyOTP = (key, inputOtp) => {
  const normalizedKey = String(key).toLowerCase().trim();
  const record = otpStore.get(normalizedKey);

  if (!record) {
    return { valid: false, reason: 'OTP not found or expired. Please generate a new OTP.' };
  }

  if (Date.now() > record.expiry) {
    otpStore.delete(normalizedKey);
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedKey);
    return { valid: false, reason: 'Too many failed attempts. Please request a new OTP.' };
  }

  const cleanInput = String(inputOtp).trim();
  if (record.otp !== cleanInput) {
    record.attempts += 1;
    otpStore.set(normalizedKey, record);
    const remaining = MAX_ATTEMPTS - record.attempts;
    return { valid: false, reason: `Incorrect OTP. ${remaining} attempt(s) remaining.` };
  }

  // OTP is valid – remove it
  otpStore.delete(normalizedKey);
  return { valid: true };
};

/**
 * Remove OTP from store (e.g., after password reset complete)
 * @param {string} key
 */
const clearOTP = (key) => {
  const normalizedKey = String(key).toLowerCase().trim();
  otpStore.delete(normalizedKey);
};

/**
 * Check if a valid (unexpired) OTP exists for the key
 * @param {string} key
 * @returns {boolean}
 */
const hasActiveOTP = (key) => {
  const normalizedKey = String(key).toLowerCase().trim();
  const record = otpStore.get(normalizedKey);
  if (!record) return false;
  if (Date.now() > record.expiry) {
    otpStore.delete(normalizedKey);
    return false;
  }
  return true;
};

// Periodically clean expired OTPs from memory
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiry) {
      otpStore.delete(key);
    }
  }
}, 60 * 1000); // every minute

module.exports = { generateOTP, storeOTP, verifyOTP, clearOTP, hasActiveOTP, getActiveOTP };
