const axios = require('axios');
const { Parser } = require('htmlparser2');
const { DomHandler } = require('domhandler');
const DomUtils = require('domutils');

const logger = require('../utils/logger').initLogger({ name: 'HTML PARSER SERVICE' });

// TODO: There is more invalid url markers
const invalidAnchors = [
    'mailto',
    'whatsapp://',
    'tel',
];

// Check why this is needed
const _removeSlash = (url) => (url.endsWith('/') ? url.substring(0, url.length - 1).trim() : url.trim());

// Some anchor are relative links (/, ./, ../../), so we turn them into absolute links
const normalizeUrlToAbsolute = (baseUrl, url) => {
    if (invalidAnchors.some((inv) => url.startsWith(inv))) return null;

    try {
        const urlToCheck = (() => {
            const isRelativeUrl = url.startsWith('/') || url.startsWith('.') || url.startsWith('.') || url.startsWith('..') || !url.startsWith('http');
            if (!isRelativeUrl) return _removeSlash(url);
            return new URL(url, _removeSlash(baseUrl)).href;
        })();
        const urlWithoutFragment = new URL(urlToCheck).hash ? urlToCheck.replace(new URL(urlToCheck).hash, '') : urlToCheck;
        return urlWithoutFragment;
    } catch (error) {
        logger.debug('Invalid url', url);
        return null;
    }
};

const fetchHtml = async (url, ignoreError = true) => {
    logger.info(`Fetching ${url}`);
    try {
        const response = await axios(url);
        return response.status === 200 ? response.data : null;
    } catch (error) {
        if (ignoreError) {
            logger.debug(`Error fetching ${url}: ${error.response.data}`, error);
            return null;
        }
        throw error;
    }
};

const parseHtml = (html, baseUrl, options) => new Promise((resolve, reject) => {
    const { ignoreQueryParams, filterThirdPartyDomains } = options;
    const domHandler = new DomHandler((error, dom) => {
        if (error) reject(error);

        const anchors = DomUtils.getElementsByTagName('a', dom);
        logger.debug(`Found ${anchors.length} anchor elements`);
        const anchorMapper = ({ attribs: { href } }) => (!href ? null : normalizeUrlToAbsolute(baseUrl, href));

        let filteredAnchors = [...new Set(anchors.map(anchorMapper))].filter((a) => !!a && !a.startsWith('#') && a !== '');
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
