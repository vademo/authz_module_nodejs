[![Coverage Status](https://coveralls.io/repos/github/digipolisantwerp/authz_module_nodejs/badge.svg?branch=master)](https://coveralls.io/github/digipolisantwerp/authz_module_nodejs?branch=master)
# @digipolis/Authz

Authorization module which can be used to check the permissions of an authenticated user.

### Table of contents:

<!--ts-->
   * [Installing](#installing)
      * [npm](#npm)
      * [Yarn](#yarn)
   * [Configuration](#configuration)
   * [Installation](#installation)
   * [Usage](#usage)
      * [Usage as express middleware](#usage-as-express-middleware)
      * [Usage as function](#usage-as-function)
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

#### Configuration for the use with the User Management Engine (UM):

##### Params:
| Param                     | Description                                                                           | Values                            |
| :---                      | :---                                                                                  | :---                              |
| ***debug***               | Set debugging mode                                                                    | **true** / **false** (default)    |
| ***source***              | The source to use by default. You can also specify a source in the function call      | **authzv2** / **meauthz**         |
| ***sources***             | Object with possible authz sources and their configurations                           | ```{ authzv2: { _config_ }}```    |
| authzv2: ***applicationId***       | Name of application from UM                                                           | *\_APPLICATION_ID\_*              |
| authzv2: ***url***        | Url of the authz api (v2) You can find this on the api-store                          | *\_URL\_OAUTHZ\_*                 |
| authzv2: ***apiKey***     | Api key. You will need to create an application with a contract with the authz api    | *\_APIKEY\_*                      |

##### Example:

```javascript
const { config } = require('@digipolis/authz');

config({
  debug: true,
  source: 'authzv2',
  sources: {
    authzv2: {
      url:  '_URL_AUTHZ_',
      apiKey: '_APIKEY_',
      applicationId: '_APPLICATION_ID_',
    },
    meauthz: {
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
// Check mutiple permissions in default source
router.get('/', hasPermission(['login-app', 'admin-app']), controller);
// Check permission in default meauthz source
router.get('/', hasPermission('login-app', 'meauthz'), controller);

```
#### Usage as function:
Configuration should be done before usage.

```javascript
const { checkPermission } = require('@digipolis/authz');
const { create } = require('./itemcreator.service');

async function createSomething(params, usertoken) {
    await checkPermission(usertoken, 'login-app'); //throws error if invalid
    await checkPermission(usertoken, ['login-app', 'use-app']); //throws error if invalid
    await checkPermission(usertoken, 'login-app', 'meauthz'); //throws error if invalid
    return create(params);
}
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
-  `Missing permissions: permission1` [Detail](#missing-permissions)
-  `Failed to retrieve permissions.` [Detail](#failed-to-retrieve-permissions)
-  `No authorization found in header.`

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
-  **Lodash:** [npm](https://www.npmjs.com/package/lodash), [Github](https://github.com/lodash/lodash)
-  **Request:** [npm](https://www.npmjs.com/package/request), [Github](https://github.com/request/request)
-  **Request-Promise:** [npm](https://www.npmjs.com/package/request-promise), [Github](https://github.com/request/request-promise)
-  **winston:** [npm](https://www.npmjs.com/package/winston), [Github](https://github.com/winstonjs/winston)


## Versioning

We use [SemVer](http://semver.org/)

for versioning. For the released version check changelog / tags

## Authors

* **Olivier Van den Mooter** - *Initial work* - [Vademo](https://github.com/vademo)

See also the list of [contributors](https://github.com/digipolisantwerp/authz_module_nodejs/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
