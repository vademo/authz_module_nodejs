const config = require('../../config');
const { MEAUTHZ_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../../errors/error.messages');
const request = require('request-promise');
const PermissionError = require('../../errors/permission.error');

async function getPermissions(Authorization) {
  const { sources } = config.getConfig();

  try {
    if (!sources || !sources.meauthz) {
      throw new Error(MEAUTHZ_CONFIG_MISSING);
    }
    if (!sources.meauthz.applicationId) {
      throw new Error(APPLICATIONID_MISSING);
    }
    const querysparams = { applicationId: sources.meauthz.applicationId };
    const headers = {
      apiKey: sources.meauthz.apikey,
      Authorization: `Bearer ${Authorization}`,
    };
    const body = await request.get({
      url: `${sources.meauthz.url}/permissions`,
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
