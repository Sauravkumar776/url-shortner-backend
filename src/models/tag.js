const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tagSchema = new mongoose.Schema({
  tagId: { type: String, unique: true, default: uuidv4 },
  userId: { type: String, required: true, index: true },
  tagName: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
