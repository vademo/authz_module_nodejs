const config = require('./config');
const hasPermission = require('./middlewares/haspermission.middleware');
const checkPermission = require('./services/permissionvalidation.service');

module.exports = {
  config: config.setConfig,
  getConfig: config.getConfig,
  hasPermission,
  checkPermission,
};
