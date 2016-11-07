/**
 * Meta data about suite or test: tags, skip condition, only
 *
 * @type {Meta}
 */
module.exports = class Meta {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Object} options.suite
   * @param {String} options.name
   * @param {Function} options.fn
   * @param {Object} options.meta
   */
  constructor(options) {
    // assert options
    this._options = options;
  }
};
