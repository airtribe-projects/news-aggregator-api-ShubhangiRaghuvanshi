const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middlewares/authenticateJWT');
const nodeCache = require('node-cache');
const User = require('../models/users');
const Article = require('../models/Article');
const crypto = require('crypto');
const router = express.Router();

// Initialize cache with TTL of 60 seconds
const newsCache = new nodeCache({ stdTTL: 60 });

// Helper: Generate unique ID for an article
function generateArticleId(article) {
    const uniqueString = `${article.title}-${article.url}-${article.publishedAt}`;
    return crypto.createHash('sha256').update(uniqueString).digest('hex');
}

// GET /news - Fetch articles based on user preferences
router.get('/news', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const preferences = user.preferences;
        if (!preferences || preferences.length === 0) {
            return res.status(400).json({ message: 'No preferences set. Please update your preferences.' });
        }

        const cacheKey = `${req.user.id}-${JSON.stringify(preferences.sort())}`;
        const cachedNews = newsCache.get(cacheKey);
        if (cachedNews) {
            return res.status(200).json({ source: 'cache', articles: cachedNews });
        }

        const apiUrl = `${process.env.NEWS_API_BASE_URL}`;
        const newsPromises = preferences.map(async (pref) => {
            const params = {
                apiKey: process.env.NEWS_API_KEY,
                language: 'en',
                q: pref.category,
            };
            const response = await axios.get(apiUrl, { params });
            const enrichedArticles = (response.data.articles || []).map((article) => {
                const id = generateArticleId(article);
                return { ...article, id };
            });
            await Article.insertMany(
                enrichedArticles.map((article) => ({ ...article, id: generateArticleId(article) })),
                { ordered: false }
            ).catch(() => {}); // Ignore duplicate key errors
            return enrichedArticles;
        });

        const allArticles = (await Promise.all(newsPromises)).flat();
        newsCache.set(cacheKey, allArticles);

        res.status(200).json({ articles: allArticles });
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ message: 'Failed to fetch news articles.', error: error.message });
    }
});

// POST /news/:id/read - Mark an article as read
router.post("/news/:url/read", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const articleUrl = decodeURIComponent(req.params.url);  // Decoding the URL
        console.log('Decoded Article URL:', articleUrl);  // Debugging line

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json('User not found');
        }

        // Check if the article URL is already in the readArticles array
        if (user.readArticles.includes(articleUrl)) {
            return res.status(400).json({ message: "Article already marked as read" });
        }

        // Add the article URL to the user's readArticles array
        user.readArticles.push(articleUrl);
        await user.save();

        console.log('Updated readArticles:', user.readArticles);  // Debugging line

        return res.status(200).json({ message: "Article marked as read successfully" });
    } catch (err) {
        console.error("Error marking article as read:", err.message);
        return res.status(500).json({ message: "Failed to mark article as read", error: err.message });
    }
});


// GET /news/read - Fetch read articles
router.get('/news/read', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const readUrls = user.readArticles;  // This will contain the article URLs
        console.log('Read Article URLs:', readUrls);  // Debugging line

        if (!readUrls || readUrls.length === 0) {
            return res.status(200).json({ message: 'No read articles found', articles: [] });
        }

        const articles = [];

        for (const articleUrl of readUrls) {
            try {
                const apiUrl = `${process.env.NEWS_API_BASE_URL}?apiKey=${process.env.NEWS_API_KEY}&q=${encodeURIComponent(articleUrl)}`;
                const response = await axios.get(apiUrl);

                if (response.data.articles && response.data.articles.length > 0) {
                    const article = response.data.articles[0];  // Assuming the first article matches the URL
                    articles.push(article);
                }
            } catch (error) {
                console.error(`Error fetching article with URL ${articleUrl}:`, error.message);
            }
        }

        return res.status(200).json({
            message: 'Read articles retrieved successfully',
            articles: articles,
        });

    } catch (error) {
        console.error('Error fetching read articles:', error.message);
        return res.status(500).json({ message: 'Error fetching read articles', error: error.message });
    }
});



module.exports = router;
