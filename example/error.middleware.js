// Handle PermissionErrors from hasPermission middleware

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
