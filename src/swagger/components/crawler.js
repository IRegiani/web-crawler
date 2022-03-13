const id = {
    type: 'string',
    example: '622cfda16afd8830ef6c3a83',
    minLength: 24,
    maxLength: 24,
    description: 'Unique identifier for a crawler object',
};

module.exports = () => ({
    smallCrawler: {
        type: 'object',
        properties: {
            id,
            firstLevelUrls: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'uri',
                    example: 'https://www.google.com.br/imghp?hl=pt-BR&tab=wi',
                },
            },
        },
    },
    crawler: {
        type: 'object',
        properties: {
            id,
            maxDepth: {
                type: 'number',
                example: 40,
                description: 'Indicates how deep the crawler will go',
            },
            initialUrl: {
                type: 'string',
                format: 'uri',
                example: 'https://www.google.com',
                description: 'Root URL',
            },
            status: {
                type: 'string',
                example: 'pending',
                enum: ['pending', 'ongoing', 'completed'],
                description: 'Marks if the crawling operation has completed',
            },
            urls: {
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        example: 'https://www.google.com.br/imghp?hl=pt-BR&tab=wi',
                        type: 'string',
                        format: 'uri',
                    },
                },
            },
            duration: {
                type: 'number',
                example: 468.772,
                description: 'Time in seconds that took to complete the entire craw operation',
            },
            size: {
                type: 'number',
                example: 4356,
                description: 'Total amount of URLs on this document',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2022-03-13T01:50:22.229Z',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2022-03-13T01:58:11.027Z',
            },
        },
    },
});
