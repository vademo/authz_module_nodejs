const permissionValidation = require('../services/permissionvalidation.service');

function hasPermission(requiredPermissions, source) {
  return async (req, res, next) => {
    try {
      await permissionValidation(req.get('authorization'), requiredPermissions, source);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}


module.exports = hasPermission;
