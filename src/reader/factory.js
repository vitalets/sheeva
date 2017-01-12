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

exports.addChild = function (parent, child) {
  parent.children.push(child);
  child.parents = parent.parents.concat([parent]);
  child.parent = parent;
};

exports.addHook = function (parent, type, fn) {
  parent[type].push(fn);
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
