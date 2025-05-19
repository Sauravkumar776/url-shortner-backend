const User = require('../models/user');
const { generateToken } = require('../utils/jwtService');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');
const mongoose = require('mongoose');

const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

// Helper for standard error logging
function logError(context, error) {
  console.error(`[${context}]`, error);
}

// Signup Controller
const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields (email, password, name) are required.' });
    }

    console.log('Signup request received for:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    const user = new User({ email, password, name });
    const verificationToken = user.generateVerificationToken();

    await user.save({ session });

    const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail(
      user.email,
      'Email Verification',
      'Please verify your email',
      `<p>Hello ${name},</p><p>Click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`
    );

    await session.commitTransaction();
    res.status(201).json({ message: 'User created successfully. Please verify your email.' });

  } catch (error) {
    await session.abortTransaction();
    logError('Signup Error', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  } finally {
    session.endSession();
  }
};


// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    console.log('Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
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
    logError('Login Error', error);
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};


// Email Verification Controller
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    console.log('Email verification attempt.');

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

  } catch (error) {
    logError('Email Verification Error', error);
    res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
  }
};


module.exports = { signup, login, verifyEmail };
