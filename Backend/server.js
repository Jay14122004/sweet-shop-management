const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (only for non-test environments)
if (process.env.NODE_ENV !== 'test') {
  const connectDB = require('./config/database');
  connectDB();
}

// Routes
app.use('/api/sweets', require('./routes/sweetRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sweet Shop API is running' });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Sweet Shop server running on port ${port}`);
  });
}

module.exports = app;