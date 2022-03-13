const { StatusCodes } = require('http-status-codes');

const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'DB SERVICE' });

module.exports = (options) => {
    const { Crawler } = options?.Crawler || require('../models')();

    const createCrawlerEntry = async (url, anchors, maxDepth) => {
        const crawler = new Crawler({ initialUrl: url, urls: [anchors], maxDepth });
        await crawler.save();
        logger.info('New crawler entry created', crawler.id);
        return crawler;
    };

    const getList = async () => Crawler.find();

    const getOne = async (id) => {
        const crawlerList = Crawler.findById(id).exec();
        // TODO: Type to database error
        if (!crawlerList) throw new CustomError(`Id ${id} not found`, StatusCodes.BAD_REQUEST);
        return crawlerList;
    };

    const markAsCompleted = async (id, createdAt, urls) => {
        logger.info(`Marking ${id} as complete`);
        await Crawler.findByIdAndUpdate(id, { status: 'completed', duration: (new Date() - new Date(createdAt)) / 1000, urls });
    };

    return {
        createCrawlerEntry,
        getList,
        getOne,
        markAsCompleted,
    };
};
