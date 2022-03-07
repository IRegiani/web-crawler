const { Resolver } = require('dns').promises;

const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER CONTROLLER' });
const { handleError, isExpectedError, CustomError } = require('../utils/error')();

module.exports = ({ options } = {}) => {
    const htmlParser = options?.htmlParser || require('../service/htmlParser')();
    const resolver = options?.resolver || new Resolver();
    resolver.setServers(['1.1.1.1']);

    const CrawlerController = {

        async crawler(request, response, next) {
            // eslint-disable-next-line no-unused-vars
            const { body: { url, webhook, ignoreQueryParams = false } } = request;
            // const { db } = response.locals;

            try {
                logger.info(`Creating crawler for ${url}`);
                if (!url) throw new CustomError('Missing url', StatusCodes.BAD_REQUEST);
                await resolver.resolve4(new URL(url).hostname).catch(() => { throw new CustomError('Invalid url', StatusCodes.BAD_REQUEST); });
                if (webhook && !webhook.url) throw new CustomError('Missing url on webhook', StatusCodes.BAD_REQUEST);
                if (webhook && !webhook.body) throw new CustomError('Missing body on webhook', StatusCodes.BAD_REQUEST);
                if (typeof ignoreQueryParams !== 'boolean') throw new CustomError('ignoreQueryParams should be a boolean', StatusCodes.BAD_REQUEST);
                // TODO: Implement webhook

                // TODO: Implement a denylist of urls
                // TODO: Continue on URL fetch/parse failure/timeout

                const urlFixed = url.includes('http') ? url : `https://${url}`;
                const html = await htmlParser.fetchHtml(urlFixed);
                const anchors = await htmlParser.parseHtml(html, urlFixed, ignoreQueryParams);

                logger.success('Crawler completed successfully');

                return response.status(StatusCodes.CREATED).json({ anchors });
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return CrawlerController;
};
