const { Resolver } = require('dns').promises;

const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER CONTROLLER' });
const { handleError, isExpectedError, CustomError } = require('../utils/error')();

module.exports = ({ options } = {}) => {
    const htmlParser = options?.htmlParser || require('../service/htmlParser')();
    const dbService = options?.dbService || require('../service/db')();
    const deepCrawler = options?.deepCrawler || require('../service/deepCrawler')();
    const resolver = options?.resolver || new Resolver();
    resolver.setServers(['1.1.1.1']);

    const CrawlerController = {

        async crawler(request, response, next) {
            const { body: { url, webhook, ignoreQueryParams = false, maxDepth } } = request;

            try {
                logger.info(`Creating crawler for ${url}`);
                if (!url) throw new CustomError('Missing url', StatusCodes.BAD_REQUEST);

                const urlFixed = url.includes('http') ? url : `https://${url}`;
                let hostname;
                let protocol;
                try {
                    ({ hostname, protocol } = new URL(urlFixed));
                    await resolver.resolve4(hostname);
                } catch (error) {
                    throw new CustomError('Invalid url', StatusCodes.BAD_REQUEST);
                }

                if (webhook && !webhook.url) throw new CustomError('Missing url on webhook', StatusCodes.BAD_REQUEST);
                if (webhook && !webhook.body) throw new CustomError('Missing body on webhook', StatusCodes.BAD_REQUEST);
                if (typeof ignoreQueryParams !== 'boolean') throw new CustomError('ignoreQueryParams should be a boolean', StatusCodes.BAD_REQUEST);
                // TODO: Implement webhook

                // TODO: Implement a denylist of urls
                // TODO: Continue on URL fetch/parse failure/timeout, save on DB

                const html = await htmlParser.fetchHtml(urlFixed);
                const anchors = await htmlParser.parseHtml(html, `${protocol}//${hostname}`, ignoreQueryParams);

                logger.success('First level completed successfully');

                const entry = await dbService.createCrawlerEntry(urlFixed, anchors, webhook, maxDepth);
                // This should be a Worker?
                deepCrawler.start(entry.id);

                return response.status(StatusCodes.CREATED).json({ firstLevelAnchors: anchors, id: entry.id });
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return CrawlerController;
};
