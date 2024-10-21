// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
exports.authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (userId, role) to req object
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to authorize specific roles (e.g., 'admin')
exports.authorizeRoles = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied, insufficient permissions' });
    }
    next();
  };
};
