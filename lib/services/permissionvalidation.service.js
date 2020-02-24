const { difference } = require('lodash');
const { TOKEN_MISSING, PERMISSION_MISSING, SOURCE_INVALID, SOURCE_MISSING, PERMISSION_FORMAT_INVALID, DISABLED_CONFIGURATION } = require('../errors/error.messages');
const PermissionError = require('../errors/permission.error');
const permissionsService = require('../services/permissions.service');
const { logger } = require('../helper/logging.helper');
const config = require('../config');

function checkPermissions(requiredPermissions = [], foundPermissions) {
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  const missingPermissions = difference(required, foundPermissions);

  if (!Array.isArray(foundPermissions)) {
    throw new PermissionError(PERMISSION_FORMAT_INVALID);
  }

  if (missingPermissions.length > 0) {
    throw new PermissionError(`${PERMISSION_MISSING} ${missingPermissions.join(' ,')}`, {
      missingPermissions,
      requiredPermissions,
      foundPermissions,
    });
  }
}

async function checkPermission(authToken, requiredPermissions, requestedsource) {
  const configuration = config.getConfig();
  const { sources } = configuration;
  const source = requestedsource || configuration.source;
  if (configuration.disabled) {
    logger.error(`${DISABLED_CONFIGURATION}`, { authToken, requiredPermissions, requestedsource });
    return;
  }
  if (!authToken) throw new PermissionError(TOKEN_MISSING);
  if (!source) throw new PermissionError(SOURCE_MISSING);
  if (!sources[source]) throw new PermissionError(SOURCE_INVALID);

  const permissions = await permissionsService.getPermissions(authToken, source);
  checkPermissions(requiredPermissions, permissions, source);
}

module.exports = checkPermission;
