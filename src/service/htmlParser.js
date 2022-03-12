const axios = require('axios');
const { Parser } = require('htmlparser2');
const { DomHandler } = require('domhandler');
const DomUtils = require('domutils');

// const { CustomError } = require('../utils/error')();
const logger = require('../utils/logger').initLogger({ name: 'HTML PARSER SERVICE' });

// Check why this is needed
const _removeTailSlash = (url) => (url.endsWith('/') ? url.substring(0, url.length - 1).trim() : url.trim());

const normalizeUrlToAbsolute = (baseUrl, url) => {
    const urlToCheck = (() => {
        const isRelativeUrl = url.startsWith('/') || url.startsWith('.') || url.startsWith('.') || url.startsWith('..') || !url.startsWith('http');
        if (!isRelativeUrl) return _removeTailSlash(url);
        return new URL(url, _removeTailSlash(baseUrl)).href;
    })();
    const urlWithoutFragment = new URL(urlToCheck).hash ? urlToCheck.replace(new URL(urlToCheck).hash, '') : urlToCheck;
    return urlWithoutFragment;
};

const fetchHtml = async (url) => {
    logger.info(`Fetching ${url}`);
    try {
        const response = await axios(url);
        return response.status === 200 ? response.data : null;
    } catch (error) {
        logger.debug(`Error fetching ${url}`, error);
        return null;
    }
};

const parseHtml = (html, baseUrl, ignoreQueryParams, filterThirdPartyDomains) => new Promise((resolve, reject) => {
    if (!baseUrl) resolve([]);
    const domHandler = new DomHandler((error, dom) => {
        if (error) reject(error);

        const anchors = DomUtils.getElementsByTagName('a', dom);
        logger.debug(`Found ${anchors.length} anchor elements`);
        // Some anchor are relative links (/, ./, ../../), so we turn them into absolute links
        const anchorMapper = ({ attribs: { href } }) => (!href ? null : normalizeUrlToAbsolute(baseUrl, href));
        // console.log(Array.from(document.getElementsByTagName('a')).map(a => a.href))

        // TODO: There is more invalid url markers
        let filteredAnchors = [...new Set(anchors.map(anchorMapper))].filter((a) => !!a && !a.startsWith('#') && a !== '' && !a.includes('mailto'));
        logger.debug(`Removed ${anchors.length - filteredAnchors.length} repeated or invalid anchors`);

        if (ignoreQueryParams) {
            const beforeFilterLength = filteredAnchors.length;
            filteredAnchors = [...new Set(filteredAnchors.map((a) => (a.includes('?') ? a.substring(0, a.indexOf('?')) : a)))];
            logger.debug(`Removed ${beforeFilterLength - filteredAnchors.length} anchors with query params`);
        }

        if (filterThirdPartyDomains) {
            const beforeFilterLength = filteredAnchors.length;
            const { hostname } = new URL(baseUrl);
            filteredAnchors = filteredAnchors.filter((a) => a.includes(hostname));
            logger.debug(`Removed ${beforeFilterLength - filteredAnchors.length} anchors outside ${baseUrl}`);
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
