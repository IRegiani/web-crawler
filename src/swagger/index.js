const config = require('config');

module.exports = () => {
    const swaggerDocumentation = {
        openapi: '3.0.3',
        info: {
            title: 'WebCrawler',
            description: 'Retrieves all URLs and saves them on Mongo DB',
            version: '1.0.0',
        },
        servers: [{ url: `http://localhost:${config.get('server.port')}${config.get('server.version')}` }],
        paths: require('./paths')(),
        components: { schemas: require('./components/crawler')() },
    };

    return swaggerDocumentation;
};
