const axios = require('axios');
const pLimit = require('p-limit');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER SERVICE' });

// TODO: Update this package
const limit = pLimit(200);

module.exports = (options) => {
    const dbService = options?.dbService || require('./db')();
    const htmlParser = options?.htmlParser || require('./htmlParser')();

    const crawUrls = async (urls, parserOptions) => Promise.all(urls.map((u) => limit(
        () => htmlParser.fetchHtml(u).then((res) => htmlParser.parseHtml(res, u, parserOptions)),
    )));

    const run = async (crawlerId, webhook, parserOptions) => {
        // TODO: This maxDepth should be reworked
        const { maxDepth, urls, createdAt, initialUrl } = await dbService.getOne(crawlerId);
        dbService.updateStatus(crawlerId, 'ongoing-2');

        // const maxDepthIndex = maxDepth - 1;
        // TODO: Removing this would save memory
        const visitedUrls = new Set();
        // const visitedUrls = new Set([initialUrl, ...urls[0]]);
        visitedUrls.add(initialUrl);
        let currentUrlList = urls[0];

        let currentDepth = 1;
        while (currentDepth < maxDepth) {
            logger.info(`\t>>>>>>>>>>>>>>>>>>>> \t Starting crawler at level ${currentDepth + 1}. Has ${currentUrlList.length} items\n`);

            const onlyNotVisitedUrls = currentUrlList.filter((url) => !visitedUrls.has(url));
            logger.debug(`Already visited ${currentUrlList.length - onlyNotVisitedUrls.length} urls, skipping`);
            // eslint-disable-next-line no-await-in-loop
            const newUrls = await crawUrls(onlyNotVisitedUrls, parserOptions);

            // TODO: Ideally the urls traversal should be kept, possible option: { 0: [], 0-1: []}
            // The levelList should contain only new and unvisited urls
            const levelList = [...new Set(newUrls.flat())].filter((url) => !visitedUrls.has(url));
            onlyNotVisitedUrls.forEach(visitedUrls.add, visitedUrls);
            if (levelList.length !== 0) {
                // eslint-disable-next-line no-await-in-loop
                await dbService.updateLevelData(crawlerId, levelList, `ongoing-${currentDepth + 1}`);
                currentUrlList = levelList;
            } else {
                logger.warn(`No more new URLs were found. Exiting at depth ${currentDepth + 1}`);
                break;
            }

            currentDepth += 1;
        }

        await dbService.markAsCompleted(crawlerId, createdAt);

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
                logger.error(`Error on webhook response: ${JSON.stringify(err.response.data)}`, err);
            }
        }
    };

    return {
        run,
    };
};
