/**
 * Utils
 */

/**
 * Push item into array for specified key of map. Array is created if needed.
 *
 * @param {Map} map
 * @param {*} key
 * @param {*} item
 */
exports.pushToMap = function (map, key, item) {
  if (map.has(key)) {
    map.get(key).push(item);
  } else {
    map.set(key, [item]);
  }
};

/**
 * Maps Map ala array .map()
 *
 * @param {Map} map
 * @param {Function} fn
 */
exports.mapMap = function (map, fn) {
  map.forEach((value, key) => map.set(key, fn(value, key)));
};

/**
 * Asserts that value is function
 *
 * @param {*} value
 * @param {String} msg
 */
exports.assertFn = function(value, msg) {
  if (typeof value !== 'function') {
    throw new Error(msg);
  }
};

/**
 * Calls function in Promise.resolve().then
 *
 * @param {Function} fn
 * @returns {Promise}
 */
exports.thenCall = function(fn) {
  return Promise.resolve().then(fn);
};
