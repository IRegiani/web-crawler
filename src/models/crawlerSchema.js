const { Schema } = require('mongoose');

const crawlerSchema = new Schema({
    initialUrl: { type: String, required: true },
    webhook: { message: String, url: String },
    maxDepth: Number,
    duration: Number,
    status: { type: String, default: 'pending' },
    urls: Object,
}, { timestamps: true });

crawlerSchema.set('toJSON', {
    getters: true,
    versionKey: false,
    transform: (_, obj) => (
        {
            ...obj,
            _id: undefined,
            duration: obj.duration ? obj.duration : (new Date() - new Date(obj.createdAt)) / 1000,
        }
    ),
});

module.exports = () => crawlerSchema;
