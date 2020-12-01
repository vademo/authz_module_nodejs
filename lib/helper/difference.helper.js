function difference(required, actual) {
  return required.filter(item => !actual.includes(item));
}

module.exports = difference;
