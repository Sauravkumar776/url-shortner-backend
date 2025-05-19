const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const urlSchema = new mongoose.Schema({
  urlId: { type: String, unique: true, default: uuidv4 },
  userId: { type: String, required: true, index: true }, 
  originalUrl: { type: String, required: true },
  shortSlug: { type: String, required: true, unique: true, index: true },
  customSlug: { type: String },
  expirationDate: { type: Date, default: null },
  isPrivate: { type: Boolean, default: false },
  hashedPassword: { type: String, default: null },
  tags: [{ type: String, index: true }],
  totalClicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('URL', urlSchema);
