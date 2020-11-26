const express = require('express');
const { config, hasPermission, getPermissions } = require('./../lib');
const errorhandler = require('./error.middleware');
const permissionService = require('./permission.service');
const { helloWorld, helloWorldAuthz } = require('./demo.controller');

const app = express();
const port = 3000;

// Setup configuration
config({
  debug: true,
  source: 'authzv2',
  tokenLocation: 'headers.authorization',
  sources: {
    authzv2: {
      url: process.env.AUTHZV2_URL,
      apiKey: process.env.AUTHZV2_APIKEY,
      applicationId: process.env.APPID,
    },
    meauthzv2: {
      url: process.env.MEAUTHZV2_URL,
      apiKey: process.env.MEAUTHZV2_APIKEY,
      applicationId: process.env.APPID,
    },
    myownpermissionservice: permissionService,
  },
});

app.get('/', hasPermission('login-app'), helloWorld);
app.get('/meauthz', hasPermission('login-app', 'meauthzv2'), helloWorld);
app.get('/externalPermissionservice', hasPermission('login-app', 'myownpermissionservice'), helloWorld);
app.get('/authzInController', helloWorldAuthz);
app.get('/getPermissions', async (req, res, next) => {
  try {
    const permissions = await getPermissions(req.headers.authorization, 'meauthz');
    return res.json(permissions);
  } catch (e) {
    return next(e);
  }
});

// Handle PermissionErrors from hasPermission middleware
app.use(errorhandler);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
