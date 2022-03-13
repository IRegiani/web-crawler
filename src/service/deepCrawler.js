const axios = require('axios');
const pLimit = require('p-limit');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER SERVICE' });

// TODO: Update this package
const limit = pLimit(500);

module.exports = (options) => {
    const dbService = options?.dbService || require('./db')();
    const htmlParser = options?.htmlParser || require('./htmlParser')();

    const crawUrls = async (urls, parserOptions) => Promise.all(urls.map((u) => limit(
        () => htmlParser.fetchHtml(u).then((res) => htmlParser.parseHtml(res, u, parserOptions)),
    )));

    const start = async (crawlerId, webhook, parserOptions) => {
        // TODO: This maxDepth should be reworked
        const { maxDepth = 50, urls, createdAt, initialUrl } = await dbService.getOne(crawlerId);

        const maxDepthIndex = maxDepth - 1;
        const visited = new Set(initialUrl);

        let currentDepth = 0;
        while (currentDepth < maxDepthIndex) {
            logger.info(`\t>>>>>>>>>>>>>>>>>>>> \t Starting crawler at level ${currentDepth + 2}. Has ${urls[currentDepth].length} items\n`);

            const onlyNotVisitedUrls = urls[currentDepth].filter((url) => !visited.has(url));
            logger.debug(`Already visited ${urls[currentDepth].length - onlyNotVisitedUrls.length} urls, skipping`);
            // eslint-disable-next-line no-await-in-loop
            const newUrls = await crawUrls(onlyNotVisitedUrls, parserOptions);

            // TODO: Ideally the urls traversal should be kept, possible option: { 0: [], 0-1: []}
            // The levelList should contain only new and unvisited urls
            const levelList = [...new Set(newUrls.flat())].filter((url) => !visited.has(url));
            visited.add(...levelList);
            if (levelList.length !== 0) urls.push(levelList);

            currentDepth += 1;
            if (urls[currentDepth] === undefined || urls[currentDepth].length === 0) {
                logger.warn(`No more URLs were found. Exiting at depth ${currentDepth + 1}`);
                break;
            }
        }

        await dbService.markAsCompleted(crawlerId, createdAt, urls);

        logger.success('Crawler finished\n');

        if (webhook?.url) {
            logger.info('Making request to webhook');
            try {
                const { status, data } = await axios.request({
                    method: 'POST',
                    url: webhook.url,
                    headers: { 'content-type': 'application/json', ...webhook?.headers },
                    params: webhook.params,
                    data: webhook.body,
                });
                logger.success(`Webhook response: ${status}`, data);
            } catch (err) {
                logger.error('Error on webhook response', err);
            }
        }
    };

    return {
        start,
    };
};
