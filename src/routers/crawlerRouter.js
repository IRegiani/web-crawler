module.exports = (options) => {
    const CrawlerRouter = require('express').Router();
    const CrawlerController = require('../controllers/crawlerController')(options);

    CrawlerRouter.route('/crawler').post(CrawlerController.crawler);

    return CrawlerRouter;
};
