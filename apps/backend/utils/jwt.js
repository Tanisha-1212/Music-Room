import jwt from 'jsonwebtoken';

// Get JWT config from environment
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set token in cookie
export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,                          // JavaScript can't access
    secure: NODE_ENV === 'production',       // HTTPS only in production
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site in production
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days
  });
};

// Clear token cookie
export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};