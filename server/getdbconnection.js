const mongoose = require('mongoose');
const logger = require('./logger');

const connection = mongoose.createConnection('mongodb://nmikhaliuk:fd3218697@ds012168.mlab.com:12168/todo-app');
connection.on('error', (error) => {
  console.log('connection error:');
  logger.error(error);
});
connection.once('open', function() {
  logger.info('Successfully connected to database!')
});

module.exports = function getDBConnection(querry, Schema) {
  return connection.model(querry, Schema);
}