const config = require('../config');
const { PERMISSION_ERROR } = require('../errors/error.messages');
const { logger } = require('../helper/logging.helper');

class PermissionError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'PermissionError';
    this.detail = detail;
    if (config.getConfig().debug) {
      logger.warn(`${PERMISSION_ERROR} ${message}`, detail);
    }
  }
}

module.exports = PermissionError;
