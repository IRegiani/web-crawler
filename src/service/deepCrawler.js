const logger = require('../utils/logger').initLogger({ name: 'CRAWLER SERVICE' });

// WIP: Implement P-Queue

module.exports = (options) => {
    const dbService = options?.dbService || require('./db')();
    const htmlParser = options?.htmlParser || require('./htmlParser')();

    const craw = async (urls, ignoreQueryParams) => Promise.all(urls.map((u) => htmlParser.fetchHtml(u).then((res) => htmlParser.parseHtml(res, u, ignoreQueryParams))));

    const start = async (crawlerId, ignoreQueryParams) => {
        const { maxDepth, urls, webhook, createdAt } = await dbService.getOne(crawlerId);

        let currentDepth = 1;
        const urlList = urls;
        while (currentDepth < maxDepth) {
            currentDepth += 1;
            logger.info(`Starting crawler at level ${currentDepth}`);
            // WIP: Should check if any URL on the list has already been visited
            // eslint-disable-next-line no-await-in-loop
            const newUrls = await craw(urlList[currentDepth - 2], ignoreQueryParams);
            // WIP: Flat should work for now
            urlList.push(newUrls.flat());
        }

        // TODO: This should be a single operation
        await Promise.all([
            dbService.addMoreUrlsToCrawler(crawlerId, urlList),
            dbService.markAsCompleted(crawlerId, createdAt),
        ]);

        logger.success('Crawler finished');

        if (webhook) {
            logger.info('Making request to webhook [WIP]');
        }
    };

    return {
        start,
    };
};
