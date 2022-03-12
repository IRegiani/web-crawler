/* istanbul ignore file */

const config = require('config');
const cluster = require('cluster');
const os = require('os');
const process = require('process');

const logger = require('./src/utils/logger').initLogger({ name: 'MAIN' });

const environment = process.env.NODE_ENV || 'local';
const Service = require('./src/app');

const initService = async () => {
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

const clusterEnabled = config.get('cluster.enabled');

// Creates a worker processes
if (clusterEnabled) {
    if (cluster.isPrimary) {
        const availableCpus = os.cpus().length;
        const maxCpus = config.get('cluster.maxCpus');

        // -1 will create one process per core
        const numCPUs = maxCpus > 0 ? Math.min(maxCpus, availableCpus) : availableCpus;

        for (let i = 0; i < numCPUs; i += 1) {
            cluster.fork().on('online', () => logger.debug(`Worker [${i}] online`));
        }

        cluster.on('exit', (worker) => {
            logger.warn(`Worker ${worker.process.pid} died`);
        });
    } else {
        logger.debug(`Worker ${process.pid}: Spawning new Service instance...`);
        initService();
    }
} else {
    initService();
}
