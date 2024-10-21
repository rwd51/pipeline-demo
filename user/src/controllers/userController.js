const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Pool } = require('pg'); // Import the pg library
const pool = require('../db'); // Import the pool
const { getChannel } = require('../config/rabbitmq'); // Import RabbitMQ channel

// Helper function to execute SQL queries
const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows;
};

// Sign up a new user
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Log in a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const users = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = users[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token valid for 1 hour
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Get user's profile (Protected route)
exports.getProfile = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Get all users (Admin only route)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Student Course Registrations
exports.studentCourseRegistrations = async (req, res) => {
  const { courseId } = req.body;

  try {
    // Ensure courseId exists
    if (!courseId) {
      return res.status(400).json({ error: 'Course Id is required' });
    }

    // Retrieve RabbitMQ channel when needed
    const channel = getChannel();

    if (!channel) {
      console.error('RabbitMQ channel is not available');
      return res.status(500).json({ error: 'RabbitMQ channel is not available' });
    }

    // Construct the message with the course and user information
    const message = JSON.stringify({ courseId, userId: req.user.userId });

    // Publish the message to the queue
    channel.sendToQueue(process.env.QUEUE_NAME, Buffer.from(message));

    res.json({ message: 'Registration request sent' });
  } catch (error) {
    console.error('Error sending registration message:', error);
    res.status(500).json({ error: 'Error sending registration request' });
  }
};


