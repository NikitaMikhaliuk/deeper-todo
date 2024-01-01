const mongoose = require('mongoose');
const logger = require('./logger');
const connection = mongoose.createConnection(process.env.MONGO_URI);
connection.on('error', (error) => {
    console.log('connection error:');
    logger.error(error);
});
connection.once('open', function () {
    logger.info('Successfully connected to database!');
});

module.exports = function getDBConnection(querry, Schema) {
    return connection.model(querry, Schema);
};
