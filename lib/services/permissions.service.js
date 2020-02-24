const config = require('../config');
const datasources = require('./datasources');
const { getCache, setCache } = require('./cache.service');

async function getPermissions(authToken, datasource) {
  const token = authToken.replace(/^(Bearer )/gi, '');
  const configuration = config.getConfig();
  const source = datasource || configuration.source;

  const { sources } = config.getConfig();
  const cacheKey = `${source}.${token}`;

  let permissions = getCache(cacheKey);

  if (!permissions) {
    if (typeof sources[source] === 'function') {
      permissions = sources[source](token);
    } else {
      permissions = datasources[source].getPermissions(token);
    }
  }

  setCache(cacheKey, permissions);
  return permissions;
}

module.exports = {
  getPermissions,
};
