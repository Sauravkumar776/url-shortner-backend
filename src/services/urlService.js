const Url = require('../models/url');
const { generateShortCode } = require('../utils/codeGenerator');

async function createShortUrl(longUrl, ttl) {
    const existingUrl = await Url.findOne({ longUrl });
    if (existingUrl) {
        return existingUrl;
    }

    const shortCode = await generateShortCode();
    const newUrl = new Url({
        shortCode,
        longUrl,
        ttl,
    });

    await newUrl.save();
    return newUrl;
}


async function resolvedUrl (shortCode){
    const url = await Url.findOne({ shortCode });
    if (!url) {
        throw new Error('URL not found');
    }
    url.clickCount += 1;
    await url.save();
    return url.longUrl;
}

module.exports = {
    createShortUrl,
    resolvedUrl
}