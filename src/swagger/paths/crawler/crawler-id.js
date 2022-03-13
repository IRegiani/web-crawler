const { StatusCodes } = require('http-status-codes');

const { crawler } = require('../../components/crawler')();

module.exports = () => ({
    get: {
        tags: ['Crawler'],
        summary: 'Retrieves a crawler',
        description: 'Retrieves a crawler document',
        operationId: 'getCrawler',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Unique identifier for a crawler document',
                schema: {
                    type: 'string',
                    // pattern: /^[a-f\d]{24}$/i, TODO: Not working
                    example: '622cfda16afd8830ef6c3a83',
                    minLength: 24,
                    maxLength: 24,
                },
            },
        ],
        responses: {
            [StatusCodes.OK]: { content: { 'application/json': { schema: crawler } } },
            [StatusCodes.NOT_FOUND]: {
                description: '',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'There is no crawler with id 622d4855242968fb985ddd56',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});
