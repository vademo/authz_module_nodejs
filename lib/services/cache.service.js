const NodeCache = require('node-cache');
const config = require('../config');

const permissionCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

function getCache(key) {
  const configuration = config.getConfig();
  if (configuration.cache) {
    const cachedPermissions = permissionCache.get(key);
    if (cachedPermissions && configuration.cache) {
      return cachedPermissions;
    }
  }
  return false;
}

function setCache(key, value) {
  const configuration = config.getConfig();
  if (configuration.cache) {
    permissionCache.set(key, value);
  }
}

module.exports = {
  getCache,
  setCache,
};
