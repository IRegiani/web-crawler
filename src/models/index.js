/* istanbul ignore file */

const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');

const basename = path.basename(__filename);
const models = {};

fs.readdirSync(`${__dirname}/`)
    .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js') && !file.includes('test'))
    .forEach((file) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const schema = require(`./${file}`)();
        const schemaName = file.substring(0, 1).toUpperCase() + file.substring(1, file.length - 9);
        models[schemaName] = mongoose.model(schemaName, schema);
    });

module.exports = () => models;
