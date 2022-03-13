module.exports = () => ({
    '/crawler': require('./crawler/crawler')(),
    '/crawler/{id}': require('./crawler/crawler-id')(),
});
