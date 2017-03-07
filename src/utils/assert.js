/**
 * Assertions
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

