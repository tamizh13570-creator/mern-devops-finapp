const mongoose = require('mongoose');
const config = require('../config/config');

let isConnected = false;

const connectDB = async (throwOnError = false) => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
      setTimeout(() => connectDB(false), 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error('⚠️ MongoDB connection failed:', error.message);
    console.warn('👉 Please ensure MongoDB is running locally (e.g. `net start MongoDB` or `mongod`) or configure your MongoDB Atlas URI in backend/.env');
    if (throwOnError) {
      throw error;
    }
    console.warn('⏳ Will retry connecting in 5 seconds...\n');
    isConnected = false;
    setTimeout(() => connectDB(false), 5000);
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
};

module.exports = { connectDB, disconnectDB };
