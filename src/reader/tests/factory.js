'use strict';

/**
 * Factory that creates suite and test data structures
 *
 * @typedef {Object} Test
 * @typedef {Object} Suite
 * @typedef {Object} Hook
 */

const INHERIT_PROPS = [
  'timeout'
];

const NON_JSON_PROPS = {
  children: true,
  before: true,
  beforeEach: true,
  after: true,
  afterEach: true,
  fn: true,
  parent: true,
  parents: true,
  target: true,
};

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
    isSuite: true,
  });
  if (parent) {
    linkItems(suite, parent);
  }
  setJson(suite);
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
    retry: options.retry,
  });
  linkItems(test, parent);
  setJson(test);
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
  setJson(hook);
  return hook;
};

/**
 * Links 2 items:
 * - test + suite
 * - suite + suite
 * - hook + suite
 *
 * @param {Object} child
 * @param {Object} parent
 * @param {String} [childrenField] may be 'before|beforeEAch|..' for hooks
 */
function linkItems(child, parent, childrenField = 'children') {
  child.parent = parent;
  child.parents = parent.parents.concat([parent]);
  child.parentNames = parent.parentNames.concat([parent.name]);
  parent[childrenField].push(child);
  inheritProps(parent, child);
}

function extendBase(options, extraOptions) {
  return Object.assign({
    name: options.name,
    target: options.target,
    only: options.only,
    skip: options.skip,
    tags: options.tags || [],
    parent: undefined,
    parents: [],
    parentNames: [],
    timeout: options.timeout,
    data: options.data,
    json: {}
  }, extraOptions);
}

function inheritProps(parent, child) {
  INHERIT_PROPS.forEach(prop => {
    if (parent[prop] !== undefined && child[prop] === undefined) {
      child[prop] = parent[prop];
    }
  });
}

function setJson(item) {
  item.json = Object.keys(item)
    .filter(key => !NON_JSON_PROPS.hasOwnProperty(key))
    .reduce((res, key) => {
      res[key] = item[key];
      return res;
    }, {});
}
