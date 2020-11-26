const config = require('../../config');
const { MEAUTHZ_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../../errors/error.messages');
const axios = require('axios');
const PermissionError = require('../../errors/permission.error');

async function getPermissions(Authorization) {
  const { sources } = config.getConfig();

  try {
    if (!sources) {
      throw new Error(MEAUTHZ_CONFIG_MISSING);
    }
    const configuration = sources.meauthzv2 || sources.meauthz;

    if (!configuration) {
      throw new Error(MEAUTHZ_CONFIG_MISSING);
    }

    if (!configuration.applicationId) {
      throw new Error(APPLICATIONID_MISSING);
    }
    const querysparams = { applicationId: configuration.applicationId };
    const headers = {
      apiKey: configuration.apiKey,
      Authorization: `Bearer ${Authorization}`,
    };
    const { data } = await axios.get(`${configuration.url}/permissions`, {
      params: querysparams,
      headers,
    });
    return data.permissions;
  } catch (e) {
    if (e.status && e.status !== 200) {
      throw new PermissionError(PERMISSION_CALL_FAILED, {
        message: e.message,
      });
    } else {
      throw new PermissionError(e.message);
    }
  }
}

module.exports = {
  getPermissions,
};
