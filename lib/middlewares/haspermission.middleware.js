const get = require('../helper/get.helper');
const config = require('../config');
const permissionValidation = require('../services/permissionvalidation.service');

function getTokenFromReq(req) {
  const { tokenLocation } = config.getConfig();
  return get(req, tokenLocation);
}

function hasPermission(requiredPermissions, source) {
  return async (req, res, next) => {
    try {
      const token = getTokenFromReq(req);
      await permissionValidation(token, requiredPermissions, source);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}


module.exports = hasPermission;
