const { checkPermission } = require('./../lib');

function helloWorld(req, res) {
  return res.send('Hello World!');
}

async function helloWorldAuthInController(req, res, next) {
  try {
    if (!req.get('authorization')) throw new Error('missing token');

    await checkPermission(req.get('authorization'), 'login-app');

    return res.send('Hello World!');
  } catch (err) {
    if (err.name === 'PermissionError') {
      // eslint-disable-next-line
      console.log('Detected authorization error');
    }
    return next(err);
  }
}

module.exports = {
  helloWorld,
  helloWorldAuthInController,
};
