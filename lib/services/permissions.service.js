const config = require('../config');
const PermissionError = require('../errors/permission.error');
const datasources = require('./datasources');

async function getPermissions(token, requestedsource) {
  let { source } = config.getConfig();
  if (requestedsource) source = requestedsource;
  if (!source) {
    throw new PermissionError('No source defined for permissions');
  }
  if (!datasources[source]) {
    throw new PermissionError('No valid datasource defined for permissions');
  }
  return datasources[source].getPermissions(token);
}

module.exports = {
  getPermissions,
};
