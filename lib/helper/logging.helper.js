const winston = require('winston');

const logger = winston.createLogger();

logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

module.exports = {
  logger,
};
