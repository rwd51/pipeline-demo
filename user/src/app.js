// src/app.js
require('dotenv').config({ path: '.prod.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const port = process.env.PORT || 3000;
const app = express();
const prisma = new PrismaClient();
const { connectRabbitMQ } = require('./config/rabbitmq'); // Correct import

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiter: limit each IP to 100 requests per window (15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

// Connect to RabbitMQ
connectRabbitMQ(); // Initialize RabbitMQ connection

// API endpoints
app.use('/api/users', userRoutes); // Delegate user-related routes

// Export the app and Prisma client for use in server.js
module.exports = { app, prisma };

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
