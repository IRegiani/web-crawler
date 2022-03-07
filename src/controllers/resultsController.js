const { StatusCodes } = require('http-status-codes');

const logger = require('../utils/logger').initLogger({ name: 'RESULTS CONTROLLER' });
const { handleError, isExpectedError } = require('../utils/error')();

module.exports = () => {
    const ResultsController = {

        async getOne(request, response, next) {
            // id can be uid or url
            const { params: { id } } = request;

            try {
                logger.info(`Getting result ${id}`);

                // WIP

                logger.success(`Result ${id} successfully`);

                return response.status(StatusCodes.OK).json({});
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },

        async getList(request, response, next) {
            try {
                logger.info('Getting results');

                // WIP

                logger.success('Result list retrieved');

                return response.status(StatusCodes.OK).json([]);
            } catch (error) {
                if (isExpectedError(error)) return handleError(response, error, logger);

                return next(error);
            }
        },
    };

    return ResultsController;
};
