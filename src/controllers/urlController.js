const {createShortUrl, resolvedUrl} = require('../services/urlService');
const BASE_URL = process.env.BASE_URL;

const controller = {
    createShortUrl: async (req, res) => {
        const { longUrl, ttl } = req.body;
        try {
            const url = await createShortUrl(longUrl, ttl);
            res.status(201).json({
                shortUrl: `${BASE_URL}/${url.shortCode}`,
                longUrl: url.longUrl,
                ttl: url.ttl
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    handleRedirect: async (req, res) => {
        const { shortCode } = req.params;
        try {
            const longUrl = await resolvedUrl(shortCode);
            res.redirect(longUrl);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = controller;

