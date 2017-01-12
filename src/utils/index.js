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
