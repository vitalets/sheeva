/**
 * Factory that creates suite and test data structures
 *
 * @typedef {Object} Test
 * @typedef {Object} Suite
 */

/**
 * Creates suite object
 *
 * @param {Object} options
 */
exports.createSuite = function (options) {
  return extendBase(options, {
    children: [],
    before: [],
    beforeEach: [],
    after: [],
    afterEach: [],
  });
};

/**
 * Creates test object
 *
 * @param {Object} options
 */
exports.createTest = function (options) {
  return extendBase(options, {
    fn: options.fn,
  });
};

function extendBase(options, extraOptions) {
  return Object.assign({
    name: options.name,
    env: options.env,
    only: options.only,
    skip: options.skip,
    tags: options.tags || [],
    parents: [],
    parent: undefined,
  }, extraOptions);
}
