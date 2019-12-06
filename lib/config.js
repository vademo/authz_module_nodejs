const { logger } = require('./helper/logging.helper');
const { FORCE_CONFIG, DOUBLE_CONFIG } = require('./errors/error.messages');

let authzConfig = {
  debug: true,
  set: false,
  tokenLocation: 'headers.authorization',
  cache: true,
};

function setConfig(config, force) {
  if (force || !authzConfig.set) {
    if (force) {
      logger.warn(FORCE_CONFIG);
    }
    // @TODO: validate format config
    authzConfig = {
      set: true,
      ...config,
    };
  } else {
    logger.error(DOUBLE_CONFIG);
  }
  return authzConfig;
}

function getConfig() {
  return authzConfig;
}

module.exports = {
  getConfig,
  setConfig,
};
