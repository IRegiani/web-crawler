module.exports = (options) => {
    const ResultsRouter = require('express').Router();
    const ResultsController = require('../controllers/resultsController')(options);

    ResultsRouter.route('/results').get(ResultsController.getList);
    ResultsRouter.route('/results/:id').get(ResultsController.getOne);

    return ResultsRouter;
};
