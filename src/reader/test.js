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
   * @param {Object} options.meta
   */
  constructor(options) {
    // assert options
    this.name = options.name;
    this.fn = options.fn;
    this.meta = options.meta;
    this.parents = null;
    this.parent = null;
  }
  setParents(parents) {
    this.parents = parents;
    this.parent = parents[parents.length - 1];
  }
};
