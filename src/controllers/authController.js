const User = require('../models/user');
const { generateToken } = require('../utils/jwtService');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

const signup = async (req, res) => {
  const { email, password, name } = req.body;

  console.log('sign up request')
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const user = new User({ email, password, name });
  
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send email with verification link
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendEmail(user.email, 'Email Verification', 'Please verify your email', `<a href="${verificationUrl}">Verify Email</a>`);

  res.status(201).json({ message: 'User created. Please verify your email.' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

  if (!user.emailVerified) {
    return res.status(400).json({ message: 'Please verify your email first' });
  }

  const token = generateToken(user._id);
  res.status(200).json({ message: 'Login successful', token });
};

// Email verification handler
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.emailVerified = true;
  user.verificationToken = undefined; // Clear the token
  await user.save();

  res.status(200).json({ message: 'Email verified successfully' });
};

// Password reset handlers would also be included here...

module.exports = { signup, login, verifyEmail };
