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
   * @param {Boolean} [options.only=false]
   * @param {Boolean} [options.skip=false]
   * @param {Boolean} [options.serial=false]
   */
  constructor(options) {
    this.name = options.name;
    this.fn = options.fn;
    this.only = options.only;
    this.skip = options.skip;
    this.serial = options.serial;
    this.parents = [];
    this.parent = undefined;
    this.hasOnly = false;
    // hooks
    this.before = [];
    this.beforeEach = [];
    this.after = [];
    this.afterEach = [];
    this.tests = [];
    this.suites = [];
  }
  addSuite(suite) {
    this._addItem('suites', suite);
  }
  addTest(test) {
    this._addItem('tests', test);
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
    if (this.hasOnly) {
      this.parents.forEach(parent => parent.hasOnly = true);
    }
  }
  _addItem(type, item) {
    if (item.only) {
      this.hasOnly = true;
    }
    this[type].push(item);
    item.setParents(this.parents.concat([this]));
  }

};
