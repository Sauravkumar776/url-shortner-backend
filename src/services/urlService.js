const Url = require('../models/url');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

const createShortUrl = async ({ longUrl, userId, customSlug, ttl, private: isPrivate, password, tags }) => {
  let shortCode = customSlug || shortid.generate();

  // Check for slug conflict if custom
  if (customSlug) {
    const existing = await Url.findOne({ shortCode: customSlug });
    if (existing) {
      throw new Error('Custom slug already taken. Please choose another.');
    }
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

  const newUrl = new Url({
    longUrl,
    shortCode,
    user: userId,
    ttl,
    private: isPrivate,
    password: hashedPassword,
    tags
  });

  await newUrl.save();
  return newUrl;
};

const resolveUrl = async (shortCode, req) => {
  const url = await Url.findOne({ shortCode });
  if (!url) {
    throw new Error('URL not found');
  }

  // Expired check
  if (url.ttl && url.ttl < Date.now()) {
    throw new Error('This link has expired.');
  }

  // Analytics: increment click
  url.analytics.totalClicks += 1;

  // Track country (if provided via Cloudflare / proxy headers)
  const country = req.headers['cf-ipcountry'] || 'Unknown';
  url.analytics.countries.set(country, (url.analytics.countries.get(country) || 0) + 1);

  await url.save();
  return url.longUrl;
};

const verifyUrlPassword = async (shortCode, password) => {
  const url = await Url.findOne({ shortCode });
  if (!url) {
    throw new Error('URL not found');
  }

  if (!url.password) {
    throw new Error('This URL is not password protected.');
  }

  const isMatch = await bcrypt.compare(password, url.password);
  if (!isMatch) {
    throw new Error('Invalid password.');
  }

  return true;
};

const getUserUrls = async (userId, tags, limit = 10, page = 1) => {
  const filter = { user: userId };
  if (tags && tags.length) {
    filter.tags = { $in: tags };
  }

  const total = await Url.countDocuments(filter);
  const urls = await Url.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    total,
    page,
    limit,
    urls
  };
};

const deleteUrlById = async (userId, urlId) => {
  const url = await Url.findById(urlId);

  if (!url) {
    throw new Error('URL not found.');
  }

  // Prevent deleting others' URLs
  if (url.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized. You can only delete your own URLs.');
  }

  await Url.findByIdAndDelete(urlId);
  return { message: 'URL deleted successfully.' };
};

module.exports = {
  createShortUrl,
  resolveUrl,
  verifyUrlPassword,
  getUserUrls,
  deleteUrlById
};
