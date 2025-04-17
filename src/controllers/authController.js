const User = require('../models/user');
const { generateToken } = require('../utils/jwtService');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields (email, password, name) are required.' });
    }

    console.log('Signup request received for:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' }); // 409 Conflict is more semantic
    }

    const user = new User({ email, password, name });
    const verificationToken = user.generateVerificationToken();
    await user.save();
    const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail(
      user.email,
      'Email Verification',
      'Please verify your email',
      `<p>Hello ${name},</p><p>Click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`
    );

    // Respond to client
    res.status(201).json({ message: 'User created successfully. Please verify your email.' });

  } catch (error) {
    console.error('Error during signup:', error);

    // Handle known validation errors from Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    // Fallback for unexpected errors
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    console.log('Login request for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // 401 Unauthorized
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' }); // 403 Forbidden
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};

// Email verification handler
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    console.log('Email verification attempt with token:', token);

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    // Update user status
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};



module.exports = { signup, login, verifyEmail };
