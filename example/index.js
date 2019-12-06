const express = require('express');
const { config, hasPermission } = require('./../lib');
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
    meauthz: {
      url: process.env.MEAUTHZ_URL,
      apiKey: process.env.MEAUTHZ_APIKEY,
      applicationId: process.env.APPID,
    },
    myownpermissionservice: permissionService,
  },
});

app.get('/', hasPermission('login-app'), helloWorld);
app.get('/meauthz', hasPermission('login-app', 'meauthz'), helloWorld);
app.get('/externalPermissionservice', hasPermission('login-app', 'myownpermissionservice'), helloWorld);

app.get('/authzInController', helloWorldAuthz);

// Handle PermissionErrors from hasPermission middleware
app.use(errorhandler);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
