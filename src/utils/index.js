/**
 * Utils
 */

/**
 * Asserts that value is function
 *
 * @param {*} value
 * @param {String} type
 * @param {String} msg
 */
exports.assertType = function (value, type, msg) {
  if (typeof value !== type) {
    throw new Error(msg);
  }
};

/**
 * Asserts that value is not empty
 *
 * @param {*} value
 * @param {String} msg
 */
exports.assertOk = function (value, msg) {
  if (!value) {
    throw new Error(msg);
  }
};

/**
 * Assert array
 *
 * @param {*} value
 * @param {String} msg
 */
exports.assertArray = function (value, msg) {
  if (!Array.isArray(value)) {
    throw new Error(msg);
  }
};

/**
 * Assert length
 *
 * @param {*} value
 * @param {String} msg
 */
exports.assertLength = function (value, msg) {
  if (!value.length) {
    throw new Error(msg);
  }
};

/**
 * Calls function in Promise.resolve().then
 *
 * @param {Function} fn
 * @returns {Promise}
 */
exports.thenCall = function (fn) {
  return Promise.resolve().then(fn);
};

/**
 * Reduce array as promise chain
 *
 * @param {Array} arr
 * @param {Function} fn
 * @returns {Promise}
 */
exports.reduceWithPromises = function (arr, fn) {
  return arr.reduce((res, item) => res.then(() => fn(item)), Promise.resolve());
};

/**
 * Converts single value to array if it's not array
 *
 * @param {*} value
 * @returns {Array}
 */
exports.ensureArray = function (value) {
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

  fulfill(error) {
    if (error) {
      this.reject(error);
    } else {
      this.resolve();
    }
  }
};

/**
 * Finds nearest common node of two stacks.
 *
 * Examples:
 * [1,2,3,4] and [1,2,5] --> 2
 * [1,2] and [3,4] --> undefined
 *
 * @param {Array} stack1
 * @param {Array} stack2
 */
exports.getCommonNode = function (stack1, stack2) {
  const minLength = Math.min(stack1.length, stack2.length);
  for (let i = minLength - 1; i >= 0; i--) {
    if (stack1[i] === stack2[i]) {
      return stack1[i];
    }
  }
};

/**
 * Returns diff of two array stacks (having common base)
 * Example:
 * [1,2,3,4] and [1,2] --> [3,4]
 *
 * @param {Array} stack1
 * @param {Array} stack2
 * @returns {Array}
 */
exports.getStackDiff = function (stack1, stack2) {
  const minStack = stack2.length > stack1.length ? stack1 : stack2;
  const maxStack = stack2.length > stack1.length ? stack2 : stack1;
  return maxStack.slice(minStack.length);
};
