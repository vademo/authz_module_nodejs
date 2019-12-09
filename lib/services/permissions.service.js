const config = require('../config');
const datasources = require('./datasources');
const { getCache, setCache } = require('./cache.service');

async function getPermissions(token, source) {
  const { sources } = config.getConfig();
  const cacheKey = `${source}.${token}`;

  let permissions = getCache(cacheKey);

  if (!permissions) {
    if (typeof sources[source] === 'function') {
      permissions = await sources[source](token);
    } else {
      permissions = await datasources[source].getPermissions(token);
    }
  }

  setCache(cacheKey, permissions);
  return permissions;
}

module.exports = {
  getPermissions,
};
