const config = require('../../config');
const { AUTHZV2_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../../errors/error.messages');
const request = require('request-promise');
const PermissionError = require('../../errors/permission.error');

async function getPermissions(jwtToken) {
  const { sources } = config.getConfig();
  try {
    if (!sources || !sources.authzv2) {
      throw new Error(AUTHZV2_CONFIG_MISSING);
    }
    if (!sources.authzv2.applicationId) {
      throw new Error(APPLICATIONID_MISSING);
    }
    const querysparams = { applicationId: sources.authzv2.applicationId, jwtToken };
    const headers = { apiKey: sources.authzv2.apiKey };
    const body = await request.get({
      url: `${sources.authzv2.url}/permissions`,
      qs: querysparams,
      headers,
      json: true,
    });
    return body.permissions;
  } catch (e) {
    if (e.name === 'StatusCodeError') {
      const message = (e.error && e.error.title) ? e.error.title : e.message;
      throw new PermissionError(PERMISSION_CALL_FAILED, {
        message,
      });
    } else {
      throw new PermissionError(e.message);
    }
  }
}

module.exports = {
  getPermissions,
};
