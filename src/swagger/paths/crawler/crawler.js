const { StatusCodes } = require('http-status-codes');

const { smallCrawler, crawler } = require('../../components/crawler')();

module.exports = () => ({
    get: {
        tags: ['Crawler'],
        summary: 'Retrieves a list of crawlers',
        operationId: 'getCrawlerList',
        description: 'Returns a list of crawler documents: TODO: Add filters',
        responses: {
            [StatusCodes.OK]: {
                content: { 'application/json': { schema: { type: 'array', items: crawler } } },
            },
        },
    },
    post: {
        tags: ['Crawler'],
        summary: 'Creates a crawler',
        description: 'Initiate the crawler on a URL, returning the all URLs found at first level. Further levels are fetched asynchronously',
        operationId: 'updateJournal',
        requestBody: {
            required: true,
            description: 'Updates tags in the journal',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['url'],
                        properties: {
                            url: {
                                type: 'string',
                                format: 'uri',
                                example: 'https://www.google.com',
                                description: 'Root URL',
                            },
                            maxDepth: {
                                type: 'number',
                                example: 15,
                                default: 5,
                                description: 'Indicates how deep the crawler will go',
                            },
                            ignoreQueryParams: {
                                type: 'boolean',
                                default: true,
                                description: 'Will strip everything after "?"',
                            },
                            filterThirdPartyDomains: {
                                type: 'boolean',
                                default: true,
                                description: 'Filters out URLs that are not in the same domain or subdomain as the initial URL',
                            },
                            webhook: {
                                type: 'object',
                                required: ['url'],
                                description: 'Calls an URL with POST upon crawler completion for asynchronous operations (maxDepth > 1)',
                                properties: {
                                    url: {
                                        type: 'string',
                                        format: 'uri',
                                        example: 'https://discordapp.com/api/webhooks/:id/:token',
                                    },
                                    body: {
                                        type: 'object',
                                        properties: {},
                                        description: 'Message body that will be sent to the webhook. TODO: Add dynamic values',
                                    },
                                    headers: {
                                        type: 'object',
                                        properties: {
                                            'content-type': {
                                                type: 'string',
                                                default: 'application/json',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            [StatusCodes.CREATED]: { content: { 'application/json': { schema: smallCrawler } } },
            [StatusCodes.BAD_REQUEST]: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Missing url',
                                },
                            },
                        },
                    },
                },
            },
            [StatusCodes.INTERNAL_SERVER_ERROR]: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Failed to fetch http://crawler-test.com/robots_protocol/deepcrawl_ua_disallow/foo. Error: Request failed with status code 404',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});
