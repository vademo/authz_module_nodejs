// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');
const { config, hasPermission } = require('./../lib');
const errorhandler = require('./error.middleware');
const { helloWorld, helloWorldAuthInController } = require('./demo.controller');

const app = express();
const port = 3000;

// Setup configuration
config({
  debug: true,
  source: 'authzv2',
  sources: {
    authzv2: {
      url: process.env.AUTHZV2_URL,
      apikey: process.env.AUTHZV2_APIKEY,
      applicationId: process.env.APPID,
    },
    meauthz: {
      url: process.env.MEAUTHZ_URL,
      apikey: process.env.MEAUTHZ_APIKEY,
      applicationId: process.env.APPID,
    },
  },
});

app.get('/', hasPermission('login-app'), helloWorld);
app.get('/helloWorldAuthInController', helloWorldAuthInController);
app.get('/meauthz', hasPermission('login-app', 'meauthz'), helloWorld);

// Handle PermissionErrors from hasPermission middleware
app.use(errorhandler);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
