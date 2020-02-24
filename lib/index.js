const checkPermission = require('./services/permissionvalidation.service');
const config = require('./config');
const { getPermissions } = require('./services/permissions.service');
const hasPermission = require('./middlewares/haspermission.middleware');

module.exports = {
  checkPermission,
  config: config.setConfig,
  getConfig: config.getConfig,
  getPermissions,
  hasPermission,
};
