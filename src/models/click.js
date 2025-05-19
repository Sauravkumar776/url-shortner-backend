const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const clickSchema = new mongoose.Schema({
  clickId: { type: String, unique: true, default: uuidv4 },
  urlId: { type: String, required: true, index: true }, // reference to URL.urlId
  userId: { type: String, required: false }, // optional if logged-in user clicks
  country: { type: String, index: true },
  ip: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  deviceType: { type: String },
  os: { type: String },
  browser: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Click', clickSchema);
