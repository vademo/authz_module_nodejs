const config = require('../../config');
const { AUTHZV2_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../../errors/error.messages');
const axios = require('axios');
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
    const { data } = await axios.get(`${sources.authzv2.url}/permissions`, {
      params: querysparams,
      headers,
    });
    return data.permissions;
  } catch (e) {
    if (e.response && e.response.status && e.response.status !== 200) {
      throw new PermissionError(PERMISSION_CALL_FAILED, {
        message: e.message,
      });
    }
    throw new PermissionError(e.message);
  }
}

module.exports = {
  getPermissions,
};
