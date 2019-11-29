const { checkPermission } = require('./../lib');

function helloWord(req, res) {
  return res.send('Hello World!');
}

async function helloWordAuthInController(req, res, next) {
  try {
    if (!req.get('authorization')) throw new Error('missing token');

    await checkPermission(req.get('authorization'), 'login-app');

    return res.send('Hello World!');
  } catch (err) {
    if (err.name === 'PermissionError') {
      // eslint-disable-next-line
      console.log('Detected authorization error');
      next(err);
    }
    return next(err);
  }
}

module.exports = {
  helloWord,
  helloWordAuthInController,
};
