// const mongoose = require('mongoose');

const { Crawler } = require('../models')();
// const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'DB SERVICE' });

const createCrawlerEntry = async (url, anchors, webhook, maxDepth) => {
    const crawler = new Crawler({ initialUrl: url, urls: [anchors], webhook, maxDepth });
    await crawler.save();
    logger.info('New crawler entry created', '');
    return {};
};

const getList = async () => Crawler.find();

const getOne = async (_id) => Crawler.find({ _id });

// const addMoreUrlsToCrawler = () => {}

// const checkIfAnyUrlHasBeenVisited = () => {}

module.exports = () => ({
    createCrawlerEntry,
    getList,
    getOne,
});
