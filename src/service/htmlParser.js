const axios = require('axios');
const { Parser } = require('htmlparser2');
const { DomHandler } = require('domhandler');
const DomUtils = require('domutils');

const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'HTML PARSER SERVICE' });

const fetchHtml = async (url) => {
    logger.info(`Fetching ${url}`);
    const response = await axios(url).catch((err) => { throw new CustomError(`Error fetching ${url} ${err.message}`); });

    if (response.status !== 200) {
        throw new CustomError(`Response ${response.status} fetching ${url}`);
    }
    return response.data;
};

const parseHtml = (html, url, ignoreQueryParams) => new Promise((resolve, reject) => {
    const domHandler = new DomHandler((error, dom) => {
        if (error) reject(error);

        const anchors = DomUtils.getElementsByTagName('a', dom);
        logger.debug(`Found ${anchors.length} anchor elements`);
        // Some anchor are relative links, so we turn them into absolute links
        const anchorMapper = ({ attribs: { href } }) => {
            const anchor = href.startsWith('/') ? url + href : href;
            return anchor.endsWith('/') ? anchor.substring(0, anchor.length - 1) : anchor;
        };

        let filteredAnchors = [...new Set(anchors.map(anchorMapper))].filter((a) => !a.startsWith('#') && a !== '');
        logger.debug(`Removed ${anchors.length - filteredAnchors.length} repeated or invalid anchors`);

        if (ignoreQueryParams) {
            const beforeFilterLength = filteredAnchors.length;
            filteredAnchors = [...new Set(filteredAnchors.map((a) => (a.includes('?') ? a.substring(0, a.indexOf('?')) : a)))];
            logger.info(`Removed ${beforeFilterLength - filteredAnchors.length} anchors with query params`);
        }
        resolve(filteredAnchors);
    });
    const parser = new Parser(domHandler);
    parser.write(html);
    parser.end();
});

module.exports = () => ({
    parseHtml,
    fetchHtml,
});
