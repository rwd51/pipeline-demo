// routes/courseRoutes.js
const express = require('express');
const { createCourse } = require('../controllers/courseRegistrationController');

const router = express.Router();

// Route to create a new course
router.post('/create', createCourse);

module.exports = router;
