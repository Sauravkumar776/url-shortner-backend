const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    shortCode: {type: String, unique: true},
    longUrl: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    ttl: Number,
    clickCount: {type: Number, default: 0},
});

module.exports = mongoose.model('Url', urlSchema);