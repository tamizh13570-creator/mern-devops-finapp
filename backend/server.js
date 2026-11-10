require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const config = require('./config/config');
const { connectDB } = require('./database/connection');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const recurringService = require('./modules/recurring/recurring.service');

// Initialize app
const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security & utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'FinApp REST API',
  });
});

// Mount modular API routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/expenses', require('./modules/expenses/expense.routes'));
app.use('/api/v1/income', require('./modules/income/income.routes'));
app.use('/api/v1/budgets', require('./modules/budgets/budget.routes'));
app.use('/api/v1/categories', require('./modules/categories/category.routes'));
app.use('/api/v1/recurring', require('./modules/recurring/recurring.routes'));
app.use('/api/v1/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/v1/reports', require('./modules/reports/report.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/notification.routes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Scheduled Cron Job: Run every day at midnight (00:00) to process recurring expenses/incomes
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron Job] Checking recurring transactions...');
  try {
    await recurringService.processDueTransactions();
  } catch (err) {
    console.error('[Cron Job Error]:', err.message);
  }
});

// Start server
const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n===========================================`);
      console.log(`🚀 FinApp Server is running on port ${PORT}`);
      console.log(`📡 REST API endpoint: http://localhost:${PORT}/api/v1`);
      console.log(`📁 Database: MongoDB connected`);
      console.log(`===========================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
