const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, default: uuidv4 },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  passwordUpdatedAt: Date,
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    darkMode: { type: Boolean, default: false }
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    loggedInAt: { type: Date, default: Date.now }
  }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  apiQuota: {
    urlsLimit: { type: Number, default: 1000 },
    urlsUsed: { type: Number, default: 0 },
    resetAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordUpdatedAt = Date.now();
  }
  if (!this.userId) this.userId = uuidv4();
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = token;
  return token;
};

userSchema.methods.generateResetPasswordToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpire = Date.now() + 3600000;
  return token;
};

module.exports = mongoose.model('User', userSchema);
