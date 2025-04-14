const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  verificationToken: String, // For email verification
  resetPasswordToken: String, // For password reset
  resetPasswordExpire: Date, // Expiration time for password reset token
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
}, { timestamps: true });

// Hash the password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check if the entered password matches the stored hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = token;
  return token;
};

// Method to generate reset password token
userSchema.methods.generateResetPasswordToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpire = Date.now() + 3600000; // Token expires in 1 hour
  return token;
};

module.exports = mongoose.model('User', userSchema);