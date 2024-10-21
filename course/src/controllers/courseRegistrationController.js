// controllers/courseRegistrationController.js
const pool = require('../db'); // Import the pool
// Helper function to execute SQL queries
const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows;
};

// Create a new course (API endpoint)
exports.createCourse = async (req, res) => {
  const { courseName, courseCode, instructor } = req.body;

  if (!courseName || !courseCode || !instructor) {
    return res.status(400).json({ error: 'Course name, course code, and instructor are required' });
  }

  try {
    // Add the course to the database using SQL
    const text = `
      INSERT INTO courses (course_name, course_code, instructor) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;

    const params = [courseName, courseCode, instructor];
    const newCourse = await query(text, params);

    res.status(201).json({ message: 'Course created successfully', course: newCourse[0] });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Error creating course' });
  }
};