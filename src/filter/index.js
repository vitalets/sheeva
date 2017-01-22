/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const Base = require('../base');
const Only = require('./only');
const Skip = require('./skip');

module.exports = class Filter extends Base {
  constructor(envData) {
    super();
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

  run() {
    if (this._only.exists) {
      this._processOnly();
    } else {
      //this._processTags();
      this._skip.filter();
    }
  }

  _processOnly() {
    this._only.filter();
    if (this._config.noOnly) {
      this._only.throwNoOnlyError();
    }
  }
};
