const logger = require('../utils/logger').initLogger({ name: 'CRAWLER SERVICE' });

// WIP: Implement P-Queue

module.exports = (options) => {
    const dbService = options?.dbService || require('./db')();
    const htmlParser = options?.htmlParser || require('./htmlParser')();

    const craw = async (urls, ignoreQueryParams) => Promise.all(urls.map((u) => htmlParser.fetchHtml(u).then((res) => htmlParser.parseHtml(res, u, ignoreQueryParams))));

    const start = async (crawlerId, ignoreQueryParams) => {
        const { maxDepth, urls, webhook, createdAt } = await dbService.getOne(crawlerId);

        let currentDepth = 1;
        let currentKey = 0;
        while (currentDepth < maxDepth) {
            logger.info(`\t>>>>>>>>>>>>>>>>>>>> \t Starting crawler at level ${currentDepth + 1}\n`);

            // WIP: Should check if any URL on the list has already been visited
            currentKey = currentDepth;
            const currentFetchList = urls[currentKey];
            // eslint-disable-next-line no-await-in-loop
            const newUrls = await craw(currentFetchList, ignoreQueryParams);
            if (newUrls.length === 0) {
                logger.info(`No more URLs were found. Exiting at depth ${currentDepth}`);
                break;
            }
            // WIP: Urls should be { 0: [], 0-1: []}
            // eslint-disable-next-line no-loop-func
            newUrls.forEach((uList, index) => {
                urls[`${currentDepth - 1}-${index}`] = uList;
            });
            currentDepth += 1;
        }

        console.log(urls);

        await dbService.markAsCompleted(crawlerId, createdAt, urls);

        logger.success('Crawler finished');

        if (webhook.url) {
            logger.info('Making request to webhook [WIP]');
        }
    };

    return {
        start,
    };
};
