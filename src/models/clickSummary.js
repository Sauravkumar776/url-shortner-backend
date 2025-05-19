const mongoose = require('mongoose');

const clickSummarySchema = new mongoose.Schema({
  urlId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true }, // daily summary
  totalClicks: { type: Number, default: 0 },
  countryClicks: [{
    country: String,
    clicks: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('ClickSummary', clickSummarySchema);
