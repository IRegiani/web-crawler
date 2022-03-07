const mongoose = require('mongoose');
// const { nanoid } = require('nanoid');

const crawlerSchema = new mongoose.Schema({
    initialUrl: { type: String, required: true },
    urls: [[String]],
    webhook: { message: String, url: String },
    maxDepth: Number,
    // id: { type: String, default: nanoid },
});

// WIP:
// crawlerSchema.set('toObject', { getters: true, transform: (obj) => obj });

module.exports = () => crawlerSchema;
