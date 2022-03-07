const config = require('config');

const logger = require('./src/utils/logger').initLogger({ name: 'MAIN' });

const environment = process.env.NODE_ENV || 'local';
const Service = require('./src/app');

const init = async () => {
    try {
        logger.info(`Starting Service: environment:${environment}`);
        const service = new Service(logger);
        await service.init();

        const { port, version } = config.get('server');

        service.listen(port, (error) => {
            if (error) throw error;
            logger.success(`Service started 🚀 http://localhost:${port}${version} \n`);
        });
    } catch (error) {
        logger.error(`Error initializing Service: ${error.message}`, error);

        process.exitCode = 1;
    }
};

init();
