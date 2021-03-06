/* istanbul ignore file */

const config = require('config');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const requestContext = require('express-http-context');
const swagger = require('swagger-ui-express');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');

const RequestInterceptor = require('../interceptors/request');

// Router
const crawlerRouter = require('../routers/crawlerRouter');

const swaggerContent = require('../swagger')();

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
        this._app.use(requestContext.middleware);
        this._app.set('trust proxy', true);

        const apiVersion = config.get('server.version');
        this._app.use(RequestInterceptor());

        // Routers
        this._app.get(`${apiVersion}/`, (req, res) => res.json({ initDate: this.initDate }));
        this._app.use(apiVersion, crawlerRouter());

        this._app.use(`${apiVersion}/doc`, swagger.serve, swagger.setup(swaggerContent, { explorer: true }));

        // eslint-disable-next-line no-unused-vars
        const errorHandler = (err, req, res, next) => {
            this.logger.error(`Unhandled error in ${req.path}`, { method: req.method, path: req.path, err });
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
        };

        this._app.use((req, res) => res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' }));
        this._app.use(errorHandler);
        await this.startDB();
    }

    async listen(...params) {
        if (config.get('server.ssl')) {
            const options = {
                key: fs.readFileSync('key.pem'),
                cert: fs.readFileSync('certificate.pem'),
            };
            https.createServer(options, this._app).listen(...params);
        } else {
            this._app.listen(...params);
        }
    }

    async startDB() {
        try {
            await mongoose.connect(
                `mongodb://${config.get('db.address')}:${config.get('db.port')}`,
                { autoIndex: false, dbName: config.get('db.name'), auth: config.get('db.auth') },
            );
            this.logger.info('Database ready');
        } catch (error) {
            this.logger.error('Error connecting to DB');
            throw error;
        }
    }
}

module.exports = Service;
