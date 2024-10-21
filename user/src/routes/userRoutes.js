// src/routes/userRoutes.js
const express = require('express');
const { signup, login, getProfile, getAllUsers, studentCourseRegistrations} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit'); // Import express-rate-limit
console.log({ signup, login, getProfile, getAllUsers, studentCourseRegistrations });
console.log({ authenticateToken, authorizeRoles });
const router = express.Router();

// Rate limiter for signup
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 signup requests per window
  message: 'Too many signups from this IP, please try again later.',
});

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: 'Too many login attempts from this IP, please try again later.',
});

// Public routes
router.post('/signup', signupLimiter, signup); // Apply signup rate limiter
router.post('/login', loginLimiter, login);     // Apply login rate limiter
// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.post('/course-registration', authenticateToken, studentCourseRegistrations);
// Admin routes (authentication + admin authorization)
router.get('/all-users', authenticateToken, authorizeRoles('admin'), getAllUsers);

module.exports = router; 
