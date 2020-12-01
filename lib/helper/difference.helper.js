function difference(arr1, arr2) {
  const arrays = [arr1, arr2];
  return arrays.reduce((a, b) => a.filter(c => !b.includes(c)));
}

module.exports = difference;
