/**
 * Suite
 *
 * @type {Suite}
 */

module.exports = class Suite {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {String} options.name
   * @param {Function} options.fn
   * @param {Meta} options.meta
   */
  constructor(options) {
    this.name = options.name;
    this.fn = options.fn;
    this.meta = options.meta;
    this.parents = [];
    this.parent = undefined;
    // hooks
    this.before = [];
    this.beforeEach = [];
    this.after = [];
    this.afterEach = [];
    this.tests = [];
    this.suites = [];
  }
  addSuite(suite) {
    this.suites.push(suite);
    suite.setParents(this.parents.concat([this]));
  }
  addTest(test) {
    this.tests.push(test);
    test.setParents(this.parents.concat([this]));
  }
  addHook(type, fn) {
    this[type].push(fn);
  }
  setParents(parents) {
    this.parents = parents;
    this.parent = parents[parents.length - 1];
  }
  fill() {
    this.fn();
  }
};
