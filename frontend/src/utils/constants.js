export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Debit/Credit Card', icon: '💳' },
  { value: 'upi', label: 'UPI / GPay / PhonePe', icon: '📱' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
  { value: 'other', label: 'Other', icon: '🔄' },
];

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Gifts',
  'Other',
];

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];
