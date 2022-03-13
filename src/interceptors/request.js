/* istanbul ignore file */

const onFinished = require('on-finished');
const requestContext = require('express-http-context');
const logger = require('../utils/logger').initLogger({ name: 'REQUEST INTERCEPTOR' });

module.exports = () => {
    const beforeRequest = () => {
        const reqId = Math.random().toString(36).substr(2, 9);
        requestContext.set('reqId', reqId);
    };

    const afterFinished = (request, response) => {
        const ip = request.ip || request.connection.remoteAddress;
        const userAgent = request.get('User-Agent');
        const status = response.statusCode;
        const { method, url } = request;

        let loggerLevel = 'complete';
        if (status >= 500 && status < 600) loggerLevel = 'error';
        if (status >= 400 && status < 500) loggerLevel = 'warn';

        logger[loggerLevel]('Request completed', { status, method, url, userAgent, ip }, '\n');
    };

    const RequestInterceptor = (request, response, next) => {
        beforeRequest(request);
        onFinished(response, () => afterFinished(request, response));
        next();
    };

    return RequestInterceptor;
};
