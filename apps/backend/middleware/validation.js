// Manual validation for signup
export const validateSignup = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  } else if (username.length > 20) {
    errors.push({ field: 'username', message: 'Username cannot exceed 20 characters' });
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' });
  }

  // Email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email' });
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Manual validation for login
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email' });
  }

  // Password validation
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};