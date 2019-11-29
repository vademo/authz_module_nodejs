const { difference } = require('lodash');
const { TOKEN_MISSING, PERMISSION_MISSING } = require('../errors/error.messages');
const PermissionError = require('../errors/permission.error');
const permissionsService = require('../services/permissions.service');

function checkPermissions(requiredPermissions = [], foundPermissions) {
  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  const missingPermissions = difference(required, foundPermissions);
  if (missingPermissions.length > 0) {
    throw new PermissionError(`${PERMISSION_MISSING} ${missingPermissions.join(' ,')}`, {
      missingPermissions,
      requiredPermissions,
      foundPermissions,
    });
  }
}

async function checkPermission(authToken, requiredPermissions) {
  if (!authToken) throw new PermissionError(TOKEN_MISSING);
  const token = authToken.replace(/^(Bearer )/gi, '');
  const permissions = await permissionsService.getPermissions(token);
  checkPermissions(requiredPermissions, permissions);
}

module.exports = checkPermission;
