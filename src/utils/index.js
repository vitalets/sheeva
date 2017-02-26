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
 * Asserts that value is not empty
 *
 * @param {*} value
 * @param {String} msg
 */
exports.assertNotEmpty = function(value, msg) {
  if (!value) {
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

/**
 * Reduce array as promise chain
 *
 * @param {Array} arr
 * @param {Function} fn
 * @returns {Promise}
 */
exports.reduceWithPromises = function(arr, fn) {
  return arr.reduce((res, item) => res.then(() => fn(item)), Promise.resolve());
};

/**
 * Converts single value to array if it's not array
 *
 * @param {*} value
 * @returns {Array}
 */
exports.ensureArray = function(value) {
  return Array.isArray(value) ? value : [value];
};

/**
 * Class that store resolve/reject methods and can be fulfilled later
 */
exports.Promised = class {
  call(fn) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      fn();
    });
  }
};

/**
 * Finds nearest common parent of two nodes.
 * Each node should have `parents` property
 */
exports.getNearestCommonParent = function(node1, node2) {
  if (!node1 || !node2) {
    return null;
  }

  const maxLength = Math.max(node1.parents.length, node2.parents.length);
  for (let i = 0; i < maxLength; i++) {
    const p1 = node1.parents[i];
    const p2 = node2.parents[i];
    if (p1 != p2) {
      return node1.parents[i - 1];
    }
  }

  return node1.parents[node1.parents.length - 1];
};

/**
 * Returns diff of two array stacks (having common base)
 *
 * @param {Array} stack1
 * @param {Array} stack2
 * @returns {Array}
 */
exports.getStackDiff = function(stack1, stack2) {
  const minStack = stack2.length > stack1.length ? stack1 : stack2;
  const maxStack = stack2.length > stack1.length ? stack2 : stack1;
  return maxStack.slice(minStack.length);
};
