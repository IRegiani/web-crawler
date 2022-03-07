const config = require('config');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');

// Router
const crawlerRouter = require('../routers/crawlerRouter');
const resultsRouter = require('../routers/resultsRouter');

class Service {
    constructor(logger) {
        this.logger = logger;
        this.initDate = new Date().toISOString();
        this._app = express();
    }

    async init() {
        this._app.use(compression());
        this._app.use(helmet());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(express.json());
        this._app.use(cors(config.get('cors')));
        this._app.set('trust proxy', true);

        // add db instance in the response
        // const databaseInstance = await this.startDB();
        // this._app.use((request, response, next) => { response.locals.db = databaseInstance; next(); });

        const apiVersion = config.get('server.version');

        // Routers
        // this._app.use(AuthorizationRouter());
        this._app.use(apiVersion, crawlerRouter());
        this._app.use(apiVersion, resultsRouter());

        // const swaggerContent = require('../swagger')();
        // this._app.use(`${apiVersion}/doc`, swagger.serve, swagger.setup(swaggerContent, { explorer: true }));

        // eslint-disable-next-line no-unused-vars
        const errorHandler = (err, req, res, next) => {
            this.logger.error(`Unhandled error in ${req.path}`, { method: req.method, path: req.path, err });
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
        };

        this._app.use((req, res) => res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' }));
        this._app.use(errorHandler);
    }

    async listen(...params) {
        this._app.listen(...params);
    }

    async startDB() {
        // const engine = new StormDB.localFileEngine('./journal-db', { async: true });
        // this._db = new StormDB(engine);

        // require('../services/fileService')().checkPath();

        // // set default db value if db is empty
        // this._db.default({ users: {}, journals: [], files: {}, tags: { entry: [], journal: [] } });

        this.logger.info('Database ready');
        return this._db;
    }
}

module.exports = Service;
