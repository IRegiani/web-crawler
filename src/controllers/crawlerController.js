const { Resolver } = require('dns').promises;

const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER CONTROLLER' });
const { handleError, isExpectedError, CustomError } = require('../utils/error')();

module.exports = (options) => {
    const htmlParser = options?.htmlParser || require('../service/htmlParser')();
    const dbService = options?.dbService || require('../service/db')();
    const deepCrawler = options?.deepCrawler || require('../service/deepCrawler')();
    const resolver = options?.resolver || new Resolver({ timeout: 10000 });
    resolver.setServers(['1.1.1.1', '8.8.8.8']);

    const CrawlerController = {

        async createCrawler(request, response, next) {
            const {
                body: {
                    url,
                    webhook,
                    maxDepth = 5,
                    ignoreQueryParams = true,
                    filterThirdPartyDomains = true,
                } } = request;

            try {
                if (!url) throw new CustomError('Missing url', StatusCodes.BAD_REQUEST);

                const urlFixed = url.includes('http') ? url : `https://${url}`;
                logger.info(`Creating crawler for ${urlFixed}`);

                try {
                    const { hostname } = new URL(urlFixed);
                    await resolver.resolve4(hostname);
                } catch (error) {
                    throw new CustomError('Invalid url', StatusCodes.BAD_REQUEST);
                }

                // TODO: Those errors should be typed as ClientSideError
                if (webhook && !webhook.url) throw new CustomError('Missing url on webhook', StatusCodes.BAD_REQUEST);
                if (webhook && !webhook.body) throw new CustomError('Missing body on webhook', StatusCodes.BAD_REQUEST);
                if (typeof ignoreQueryParams !== 'boolean') throw new CustomError('ignoreQueryParams should be a boolean', StatusCodes.BAD_REQUEST);
                if (typeof filterThirdPartyDomains !== 'boolean') throw new CustomError('filterThirdPartyDomains should be a boolean', StatusCodes.BAD_REQUEST);

                // TODO: Implement a denylist of urls
                // TODO: Implement waitInterval
                // TODO: Continue on URL fetch/parse failure/timeout, save on DB

                // WIP: Use this date as initial reference to calculate duration
                const html = await htmlParser.fetchHtml(urlFixed, false)
                    .catch((err) => { throw new CustomError(`Failed to fetch ${urlFixed}. ${err}`); });
                const parserOptions = { ignoreQueryParams, filterThirdPartyDomains };
                const anchors = await htmlParser.parseHtml(html, urlFixed, parserOptions);

                logger.success('First level crawler completed successfully');

                const entry = await dbService.createCrawlerEntry(urlFixed, anchors, maxDepth);
                deepCrawler.run(entry.id, webhook, { ignoreQueryParams, filterThirdPartyDomains });

                return response.status(StatusCodes.CREATED).json({ id: entry.id, firstLevelUrls: anchors });
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async getOne(request, response, next) {
            const { params: { id } } = request;

            try {
                logger.info(`Getting crawler ${id}`);
                let crawlerData;

                try {
                    crawlerData = await dbService.getOne(id);
                } catch (error) {
                    // TODO: This error should be typed DBError
                    throw new CustomError(`DB Error reading crawler id ${id}`, StatusCodes.INTERNAL_SERVER_ERROR);
                }

                if (!crawlerData) throw new CustomError(`There is no crawler with id ${id}`, StatusCodes.NOT_FOUND);

                logger.success(`Crawler ${crawlerData.id} loaded successfully`);

                return response.status(StatusCodes.OK).json(crawlerData);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        // TODO: Add query param filters (and pagination)
        async getList(request, response, next) {
            try {
                logger.info('Getting results');

                const crawlerDataList = await dbService.getList();

                logger.success(`Retrieved list with ${crawlerDataList.length} documents`);

                return response.status(StatusCodes.OK).json(crawlerDataList);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return CrawlerController;
};
