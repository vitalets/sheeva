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
   * @param {Object} options.env
   * @param {Boolean} [options.only=false]
   * @param {Boolean} [options.skip=false]
   * @param {Boolean} [options.serial=false]
   * @param {Boolean} [options.isFile=false]
   */
  constructor(options) {
    this.name = options.name;
    this.env = options.env;
    this.only = options.only;
    this.skip = options.skip;
    this.serial = options.serial;
    this.isFile = options.isFile;
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
  _addItem(type, item) {
    if (item.only && !this.hasOnly) {
      this._setHasOnly();
    }
    this[type].push(item);
    item.setParents(this.parents.concat([this]));
  }
  _setHasOnly() {
    this.hasOnly = true;
    if (this.parent && !this.parent.hasOnly) {
      this.parents.forEach(parent => parent.hasOnly = true);
    }
  }
};
