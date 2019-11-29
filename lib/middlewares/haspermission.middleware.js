const permissionValidation = require('../services/permissionvalidation.service');

function hasPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      await permissionValidation(req.get('authorization'), requiredPermissions);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}


module.exports = hasPermission;
