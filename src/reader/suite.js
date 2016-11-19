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
    // array of children suites and tests
    this.children = [];
    this.parents = [];
    this.parent = undefined;
    // true if suite has .only in nested children
    this.hasOnly = false;
    // hooks
    this.before = [];
    this.beforeEach = [];
    this.after = [];
    this.afterEach = [];
  }
  addChild(item) {
    if (item.only && !this.hasOnly) {
      this._setHasOnly();
    }
    this.children.push(item);
    item.setParents(this.parents.concat([this]));
  }
  addHook(type, fn) {
    this[type].push(fn);
  }
  setParents(parents) {
    this.parents = parents;
    this.parent = parents[parents.length - 1];
  }
  _setHasOnly() {
    this.hasOnly = true;
    if (this.parent && !this.parent.hasOnly) {
      this.parents.forEach(parent => parent.hasOnly = true);
    }
  }
};
