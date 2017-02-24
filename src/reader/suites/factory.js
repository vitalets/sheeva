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
 * @param {Suite} parent
 */
exports.createSuite = function (options, parent = null) {
  const suite = extendBase(options, {
    children: [],
    before: [],
    beforeEach: [],
    after: [],
    afterEach: [],
  });
  if (parent) {
    linkItems(suite, parent);
  }
  return suite;
};

/**
 * Creates test object
 *
 * @param {Object} options
 * @param {Suite} parent
 */
exports.createTest = function (options, parent) {
  const test = extendBase(options, {
    fn: options.fn,
  });
  linkItems(test, parent);
  return test;
};

/**
 * Creates hook object
 *
 * @param {Object} options
 * @param {Suite} parent
 */
exports.createHook = function (options, parent) {
  const type = options.type;
  const index = parent[type].length;
  const hook = extendBase(options, {
    type,
    index,
    name: `${type} ${index}`,
    fn: options.fn,
    isPre: type.startsWith('before'),
  });
  linkItems(hook, parent, type);
  return hook;
};

function linkItems(child, parent, childrenField = 'children') {
  child.parent = parent;
  child.parents = parent.parents.concat([parent]);
  parent[childrenField].push(child);
}

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
