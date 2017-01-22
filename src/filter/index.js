/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const Base = require('../base');
const Only = require('./only');
const Skip = require('./skip');
const Tags = require('./tags');

module.exports = class Filter extends Base {
  constructor() {
    super();
    this._envData = null;
    this._only = null;
    this._skip = null;
    this._tags = null;
  }

  get envData() {
    return this._envData;
  }

  get onlyFiles() {
    return this._only.files;
  }

  run(envData) {
    this._envData = envData;
    this._init();
    this._filter();
  }

  _init() {
    this._only = new Only(this._envData);
    this._skip = new Skip(this._envData);
    this._tags = new Tags(this._envData, this._config.tags);
  }

  _filter() {
    if (this._only.exists) {
      this._processOnly();
    } else {
      this._tags.filter();
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
