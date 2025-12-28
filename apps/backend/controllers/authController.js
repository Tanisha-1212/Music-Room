import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import connectDatabase from '../config/db.js';
import passport from 'passport';

const FRONTEND_REDIRECT = process.env.FRONTEND_URL;

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // ← conditional
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ← conditional
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
    });
};

const clearTokenCookie = (res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        expires: new Date(0),
        path: '/'
    });
}

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
    scope : ['profile', 'email'],
    session: false
});

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  try {
    // Check if user exists (passport attaches it)
    if (!req.user) {
      console.error('No user in request after Google auth');
      return res.redirect(`${FRONTEND_REDIRECT}/login?error=google_auth_failed`);
    }

    // Update user status
    req.user.isOnline = true;
    req.user.lastSeen = new Date();
    await req.user.save();

    // Generate token and set cookie
    const token = generateToken(req.user._id);
    setTokenCookie(res, token);

    console.log('Google auth successful for user:', req.user.email);

    // Redirect to frontend callback
    res.redirect(`${FRONTEND_REDIRECT}/auth/google/callback`);

  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${FRONTEND_REDIRECT}/login?error=google_auth_failed`);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async(req, res) => {
    try{
        await connectDatabase();
        const {username, email, password} = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        const userExists = await User.findOne({
            $or : [{email}, {username}]
        });

        if(userExists){
             return res.status(400).json({
                success: false,
                message: userExists.email === email 
                ? 'Email already registered' 
                : 'Username already taken'
            });
        }

        const user = await User.create({
            username, 
            email, 
            password,
        });

        if(user){
            const token = generateToken(user._id);
            setTokenCookie(res, token);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: user.toPublicJSON() // Use the model method to hide sensitive data
                }
            });
        }
    }
    catch(error){
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to register user',
            error: error.message 
        });
    }
};

// @desc    Register new user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({email}).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
        }

        user.isOnline = true;
        user.lastSeen = new Date();

        await user.save();

        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                user: user.toPublicJSON() // Use the model method to hide sensitive data
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to login user',
            error: error.message 
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async(req, res) => {
    try {
        if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
            isOnline: false,
            lastSeen: new Date()
        });
        }

        clearTokenCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all password fields' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'New passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'New password must be at least 6 characters' 
      });
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Delete Account (FIXED - proper DELETE request handling)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    // FIXED: Use req.body for DELETE requests (it works with axios { data: {...} })
    const { password, confirmation } = req.body;

    // Validation
    if (!password || confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please provide password and type DELETE to confirm'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Incorrect password' 
      });
    }

    // Import Room model dynamically
    const Rooms = (await import('../models/Room.js')).default;

    // Delete all rooms created by user
    await Rooms.deleteMany({ creator: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Clear authentication cookie
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
      path: '/'
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};