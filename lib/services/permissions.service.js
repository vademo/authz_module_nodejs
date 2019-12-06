const NodeCache = require('node-cache');
const config = require('../config');
const PermissionError = require('../errors/permission.error');
const { SOURCE_INVALID, SOURCE_MISSING } = require('../errors/error.messages');
const datasources = require('./datasources');

const permissionCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

async function getPermissions(token, requestedsource) {
  const configuration = config.getConfig();
  const source = requestedsource || configuration.source;

  if (!source) throw new PermissionError(SOURCE_MISSING);
  if (!datasources[source]) throw new PermissionError(SOURCE_INVALID);

  const cacheKey = `${source}.${token}`;
  const cachedPermissions = permissionCache.get(cacheKey);

  if (cachedPermissions && configuration.cache) {
    return cachedPermissions;
  }

  const permissions = datasources[source].getPermissions(token);

  if (configuration.cache) {
    permissionCache.set(cacheKey, permissions);
  }

  return permissions;
}

module.exports = {
  getPermissions,
};
