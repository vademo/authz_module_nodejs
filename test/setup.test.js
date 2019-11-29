const { logger } = require('../lib/helper/logging.helper');

// silence logs during tests
logger.transports[0].silent = true;
