// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');
const { config, hasPermission } = require('./../lib');
const errorhandler = require('./error.middleware');
const { helloWord, helloWordAuthInController } = require('./demo.controller');

const app = express();
const port = 3000;

// Setup configuration
config({
  debug: true,
  applicationId: process.env.APPID,
  source: 'authzv2',
  sources: {
    authzv2: {
      url: process.env.AUTHZV2_URL,
      apikey: process.env.AUTHZV2_APIKEY,
    },
  },
});

app.get('/', hasPermission('login-app'), helloWord);
app.get('/helloWordAuthInController', helloWordAuthInController);

// Handle PermissionErrors from hasPermission middleware
app.use(errorhandler);

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
