/**
 * Test
 *
 * @type {Test}
 */

module.exports = class Test {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {String} options.name
   * @param {Function} options.fn
   * @param {Boolean} options.only
   * @param {Boolean} options.skip
   * @param {Number} options.originalIndex
   */
  constructor(options) {
    // assert options
    this.name = options.name;
    this.fn = options.fn;
    this.only = options.only;
    this.skip = options.skip;
    this.originalIndex = options.originalIndex;
    this.parents = [];
    this.parent = undefined;
  }
  setParents(parents) {
    this.parents = parents;
    this.parent = parents[parents.length - 1];
  }
  createContext() {
    this.context = {};
  }
};
