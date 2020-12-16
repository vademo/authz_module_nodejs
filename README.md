[![Build Status](https://travis-ci.com/digipolisantwerp/authz_module_nodejs.svg?branch=master)](https://travis-ci.com/digipolisantwerp/authz_module_nodejs)
[![Coverage Status](https://coveralls.io/repos/github/digipolisantwerp/authz_module_nodejs/badge.svg?branch=master)](https://coveralls.io/github/digipolisantwerp/authz_module_nodejs?branch=master)
[![npm version](https://badge.fury.io/js/%40digipolis%2Fauthz.svg)](https://badge.fury.io/js/%40digipolis%2Fauthz)

**npm:** [npmjs.com/package/@digipolis/authz](https://www.npmjs.com/package/@digipolis/authz)
# @digipolis/Authz

Authorization module which can be used to check the permissions of an authenticated user.

### Table of contents:

<!--ts-->
   * [Installing](#installing)
      * [npm](#npm)
      * [Yarn](#yarn)
   * [Configuration](#configuration)
      * [Example headers](#example-with-headers)
      * [Example With auth package / session](#Example-with-session-or-auth-package)
   * [Installation](#installation)
   * [Usage](#usage)
      * [Usage as express middleware](#usage-as-express-middleware)
      * [Usage as function](#usage-as-function)
      * [permissions list](#permissions-list)
      * [External authorization source](#external-authorization-source)
      * [Permissionerror](#permissionerror)
          * [Model](#model)
             * [Error messages](#error-messages)
             * [Error detail](#error-detail)
             * [Error handling](#error-handling)
   * [Running the tests](#running-the-tests)
   * [Versioning](#versioning)
   * [Authors](#authors)
   * [License](#license)
<!--te-->


## Installing

#### npm:
```sh
$ npm i @digipolis/authz
```

#### Yarn:
```sh
$ yarn add @digipolis/authz
```

## Configuration

### Available sources:
#### authzv2:
For applications which use the User Management Engine and have a JWT token of the authenticated user (mostly API's).
#### meauthzv2:
For applications which use the User Management Engine and have an OAuth2 access token of the authenticated user (mostly BFF's).

### Configuration for the use with the User Management Engine (UM):

##### Params:
| Param                             | Description                                                                                               | Values                                                |
| :---                              | :---                                                                                                      | :---                                                  |
| ***debug*** *(optional)*          | Set debugging mode                                                                                        | **true** / **false** (default)                        |
| ***disabled*** *(optional)*       | Disable the authz check. This will allow everything for each token. Only for testing / dev purposes.      | **true** / **false** (default)                        |
| ***source***                      | The source to use by default. You can also specify a source in the function call                          | **authzv2** / **meauthzv2**                             |
| ***sources***                     | Object with possible authz sources and their configurations                                               | `{ authzv2: { _config_ }}`                            |
| **tokenLocation** *(optional)*    | Location of the token on the request object. Used by middleware. Defaults to 'headers.authorization'      | headers.authorization / session.token (example)       |
| **cache** *(optional)*            | Enable cache. The permissions will be cached based for a token+source with a TTL of 600 (10min)           | **true** (default) / **false**                        |
| authzv2: ***applicationId***      | Name of application from UM                                                                               | *\_APPLICATION_ID\_*                                  |
| authzv2: ***url***                | Url of the authz api (v2) You can find this on the api-store                                              | *\_URL\_OAUTHZ\_*                                     |
| authzv2: ***apiKey***             | Api key. You will need to create an application with a contract with the authz api                        | *\_APIKEY\_*                                          |

##### Example with headers:

```javascript
const { config } = require('@digipolis/authz');

config({
  debug: true,
  source: 'authzv2',
  tokenLocation: 'headers.authorization',
  sources: {
    authzv2: {
      url:  '_URL_AUTHZ_',
      apiKey: '_APIKEY_',
      applicationId: '_APPLICATION_ID_',
    },
    meauthzv2: {
      url:  '_URL_AUTHZ_',
      apiKey: '_APIKEY_',
      applicationId: '_APPLICATION_ID_',
    },
  },
});
```

##### Example with session or auth package:
This is a typical setup for bffs that need permission checks and are already using the [Digipolis auth pacakge](https://github.com/digipolisantwerp/auth_module_nodejs) or keeping accesstokens in express-session

```javascript
const { config } = require('@digipolis/authz');

config({
  debug: true,
  source: 'meauthzv2',
  tokenLocation: 'session.userToken.accessToken', // The auth pacakge saves the token at this location
  sources: {
    meauthzv2: {
      url:  '_URL_AUTHZ_',
      apiKey: '_APIKEY_',
      applicationId: '_APPLICATION_ID_',
    },
  },
});
```
## Usage

The module can be used as an express middleware or as a function. The parameter is a string to check a single permission or an array to check multiple permissions. If a permission is missing an Error of the type [**PermissionError**](#permissionError) will be thrown.

An example of this can be found in the documentation below and in the example folder.

#### Usage as express middleware:
Configuration should be done before usage.

```javascript
const { Router } = require('express');
const { hasPermission } = require('@digipolis/authz');

const router = new Router();

// Check single permission in default source
router.get('/', hasPermission('login-app'), controller);
// Check multiple permissions in default source
router.get('/', hasPermission(['login-app', 'admin-app']), controller);
// Check permission in default meauthzv2 source
router.get('/', hasPermission('login-app', 'meauthzv2'), controller);

```
#### Usage as function:
Configuration should be done before usage.

```javascript
const { checkPermission } = require('@digipolis/authz');
const { create } = require('./itemcreator.service');

async function createSomething(params, usertoken) {
    await checkPermission(usertoken, 'login-app'); //throws error if invalid
    await checkPermission(usertoken, ['login-app', 'use-app']); //throws error if invalid
    await checkPermission(usertoken, 'login-app', 'meauthzv2'); //throws error if invalid
    return create(params);
}
```

#### External authorization source:

You can plug in your own implementation for retrieving permissions:

##### Requirements:


 * Your function should take 1 argument: `token`. The token will be stripped from the `Bearer` prefixes.
 * Permissions should be returned as an array.


```javascript
const { checkPermission, config } = require('@digipolis/authz');
const controller = require('./controller');

function AuthzImplementation (token) {
    // Retrieve the users permissions here
    return ['permission1', 'permission2'];
}

config({
  debug: true,
  source: 'externalAuthz',
  tokenLocation: 'headers.authorization',
  sources: {
    externalAuthz: AuthzImplementation,
    meauthzv2: {
      url:  '_URL_AUTHZ_',
      apiKey: '_APIKEY_',
      applicationId: '_APPLICATION_ID_',
    },
  },
});

router.get('/', hasPermission('permission1'), controller); // Use own implementation (set as default)
router.get('/', hasPermission('login-app', 'meauthz'), controller); // Use defined meauthz implementation

```
#### Permissions list:
Retrieve permissions as a list

```javascript
  // Default source (set in config)
  const permissions = await getPermissions(req.headers.authorization);

  // specific  source
  const permissionsMeauthz = await getPermissions(req.headers.authorization, 'meauthz');
```
**Returns:** *Array['string']*:

```javascript
[
    "PERMISSION_1",
    "PERMISSION_2",
    "PERMISSION_3",
]
```


#### PermissionError:

##### Model

```javascript
{
  ...extends_default_javascript_error
  name: 'PermissionError',
  message: 'Failed to retrieve permissions.' // example
  detail: {
    message: 'Invalid Token' // example
  }
}
```
##### Error messages:

-  `ApplicationId not configured.`
-  `Authzv2 not configured.`
-  `meAuthz not configured.`
-  `Missing permissions: permission1` [Detail](#missing-permissions-example)
-  `Failed to retrieve permissions.` [Detail](#failed-to-retrieve-permissions-example)
-  `No authorization found in header.`
-  `No source defined for permissions`
-  `No valid datasource defined for permissions`
-  `Permission service returned permissions in an unexpected format`

##### Error detail:

###### Failed to retrieve permissions (example):

```javascript
{
  message: "Failed to retrieve permissions",
  detail: {"messsage": _error_message_authzv2_api_ }
}
```

###### Missing permissions (example):
```javascript
{
  message: "Missing permissions: permission1",
  detail: {
    missingPermissions: ["permission1"],
    requiredPermissions: "permission1",
    foundPermissions: ["permission2"]
  }
}
```
##### Error handling:

###### Handle error from [middleware](#usage-as-express-middleware):

```javascript
function errorhandler(err, req, res, next) {
  if (err.name === 'PermissionError') {
    return res.status(401).json({
      message: err.message,
      detail: err.detail,
    });
  }
  return next(err);
}

module.exports = errorhandler;
```
###### Catch error from function:
```javascript
try {
  await checkPermission(_TOKEN_, 'login-app');
  return do_something();
} catch (err) {
  if (err.name === 'PermissionError') {
    console.log('Detected authorization error');
  }
  // Handle error in express middleware
  return next(err);
}
```


## Running the tests

Run the tests in this repo:

```bash
$ npm run test
$ npm run coverage
```
## Dependencies
-  **axios:** [npm](https://www.npmjs.com/package/axios), [Github](https://github.com/axios/axios)
-  **node-cache:** [npm](https://www.npmjs.com/package/node-cache), [Github](https://github.com/node-cache/node-cache)

## Versioning

We use [SemVer](http://semver.org/)

for versioning. For the released version check changelog / tags

## Contributing

Pull requests are always welcome, however keep the following things in mind:

- New features (both breaking and non-breaking) should always be discussed with the [repo's owner](#support). If possible, please open an issue first to discuss what you would like to change.
- Fork this repo and issue your fix or new feature via a pull request.
- Please make sure to update tests as appropriate. Also check possible linting errors and update the CHANGELOG if applicable.

## Support

* **Olivier Van den Mooter** - *Initial work* - [Vademo](https://github.com/vademo)

See also the list of [contributors](https://github.com/digipolisantwerp/authz_module_nodejs/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
