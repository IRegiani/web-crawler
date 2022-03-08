/* istanbul ignore file */

module.exports = (options) => {
    const CrawlerRouter = require('express').Router();
    const CrawlerController = require('../controllers/crawlerController')(options);

    CrawlerRouter.route('/crawler').post(CrawlerController.createCrawler);
    CrawlerRouter.route('/crawler/:id').get(CrawlerController.getOne);
    CrawlerRouter.route('/crawler').get(CrawlerController.getList);

    return CrawlerRouter;
};
