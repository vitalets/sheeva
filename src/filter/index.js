/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */


const Only = require('./only');
const Skip = require('./skip');

module.exports = class Filter {
  constructor(envData) {
    this._envData = envData;
    this._only = new Only(this._envData);
    this._skip = new Skip(this._envData);
  }

  get envData() {
    return this._envData;
  }

  get onlyFiles() {
    return this._only.files;
  }

  /**
   * Applies filter
   */
  run() {
    if (this._only.exists) {
      this._only.filter();
    } else {
      //this._processTags();
      this._skip.filter();
    }
    return this;
  }
};
