const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    id: { type: String, unique: true,required:true }, // Unique ID for the article
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    source: {
        name: { type: String },
    },
    author: { type: String },
    content: { type: String }
});

// Creating the model from the schema
const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
