require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('./connection');

const Category = require('../modules/categories/category.model');
const User = require('../modules/auth/auth.model');

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B', type: 'expense', isDefault: true },
  { name: 'Rent & Housing', icon: '🏠', color: '#4ECDC4', type: 'expense', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#45B7D1', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#96CEB4', type: 'expense', isDefault: true },
  { name: 'Health & Medical', icon: '🏥', color: '#FFEAA7', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#DDA0DD', type: 'expense', isDefault: true },
  { name: 'Transport', icon: '🚗', color: '#98D8C8', type: 'expense', isDefault: true },
  { name: 'Utilities', icon: '💡', color: '#F7DC6F', type: 'expense', isDefault: true },
  { name: 'Education', icon: '📚', color: '#BB8FCE', type: 'expense', isDefault: true },
  { name: 'Others', icon: '📦', color: '#AED6F1', type: 'both', isDefault: true },
  { name: 'Salary', icon: '💰', color: '#52BE80', type: 'income', isDefault: true },
  { name: 'Freelance', icon: '💻', color: '#5DADE2', type: 'income', isDefault: true },
  { name: 'Business', icon: '🏢', color: '#F39C12', type: 'income', isDefault: true },
  { name: 'Investment', icon: '📈', color: '#27AE60', type: 'income', isDefault: true },
  { name: 'Gifts', icon: '🎁', color: '#E91E63', type: 'income', isDefault: true },
];

const adminUser = {
  name: 'Admin User',
  email: 'admin@finapp.com',
  phone: '9999999999',
  password: 'Admin@123',
  currency: 'INR',
  isVerified: true,
};

const seed = async () => {
  try {
    await connectDB(true);
    console.log('Connected to MongoDB for seeding...');

    // Seed categories
    const existingCategories = await Category.countDocuments({ isDefault: true });
    if (existingCategories === 0) {
      await Category.insertMany(defaultCategories);
      console.log(`✅ Seeded ${defaultCategories.length} default categories`);
    } else {
      console.log(`⏭️  Categories already seeded (${existingCategories} found)`);
    }

    // Seed admin user
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      await User.create({ ...adminUser, password: hashedPassword });
      console.log(`✅ Admin user created: ${adminUser.email} / ${adminUser.password}`);
    } else {
      console.log(`⏭️  Admin user already exists`);
    }

    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seed();
