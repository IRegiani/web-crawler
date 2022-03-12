/* eslint-disable no-unused-vars */
const axios = require('axios');

const logger = require('../utils/logger').initLogger({ name: 'CRAWLER SERVICE' });

// WIP: Implement P-Queue

module.exports = (options) => {
    const dbService = options?.dbService || require('./db')();
    const htmlParser = options?.htmlParser || require('./htmlParser')();

    const craw = async (urls, ignoreQueryParams) => Promise.all(urls.map((u) => htmlParser.fetchHtml(u).then((res) => htmlParser.parseHtml(res, u, ignoreQueryParams))));

    const start = async (crawlerId, webhook, ignoreQueryParams) => {
        // TODO: This maxDepth should be reworked
        const { maxDepth = 50, urls, createdAt } = await dbService.getOne(crawlerId);

        // WIP: Should check if any URL on the list has already been visited
        // WIP: Urls should be { 0: [], 0-1: []}
        const fixedDepthIndex = maxDepth - 1;

        let currentDepth = 0;
        while (currentDepth < fixedDepthIndex) {
            logger.info(`\t>>>>>>>>>>>>>>>>>>>> \t Starting crawler at level ${currentDepth + 2}. Has ${urls[currentDepth].length} items\n`);

            const innerDepthUrls = [];
            for (let i = 0; i < urls[currentDepth].length; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                const newUrls = await craw(urls[currentDepth], ignoreQueryParams);
                if (newUrls.length) innerDepthUrls.push(newUrls);
            }
            urls.push(['a', 'b']);

            currentDepth += 1;
            if (urls[currentDepth].length === 0) {
                logger.info(`No more URLs were found. Exiting at depth ${currentDepth}`);
                break;
            }
        }

        // console.log(urls);

        await dbService.markAsCompleted(crawlerId, createdAt, urls);

        logger.success('Crawler finished');

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
