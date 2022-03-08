// const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'DB SERVICE' });

module.exports = (options) => {
    const { Crawler } = options?.Crawler || require('../models')();

    const createCrawlerEntry = async (url, anchors, webhook, maxDepth) => {
        const crawler = new Crawler({ initialUrl: url, urls: [anchors], webhook, maxDepth });
        await crawler.save();
        logger.info('New crawler entry created', crawler.id);
        return crawler;
    };

    const getList = async () => Crawler.find();

    const getOne = async (_id) => Crawler.findById(_id).exec();

    // const addMoreUrlsToCrawler = () => {}

    // const checkIfAnyUrlHasBeenVisited = () => {}

    return {
        createCrawlerEntry,
        getList,
        getOne,
    };
};
