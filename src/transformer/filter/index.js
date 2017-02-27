/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const {config} = require('../../configurator');
const Only = require('./only');
const Skip = require('./skip');
const Tags = require('./tags');

module.exports = class Filter {
  constructor() {
    this._envData = null;
    this._only = null;
    this._skip = null;
    this._tags = null;
  }

  get result() {
    return this._envData;
  }

  get meta() {
    return {
      only: {
        files: this._only.files
      },
      skip: {
        files: this._skip.files,
        suites: this._skip.suites,
        tests: this._skip.tests,
      }
    };
  }

  run(envData) {
    this._envData = envData;
    this._init();
    this._filter();
  }

  _init() {
    this._only = new Only(this._envData);
    this._skip = new Skip(this._envData);
    this._tags = new Tags(this._envData, config.tags);
  }

  _filter() {
    if (this._only.found) {
      this._processOnly();
    } else {
      this._tags.filter();
      this._skip.filter();
    }
  }

  _processOnly() {
    this._only.filter();
    if (config.noOnly) {
      this._only.throwNoOnlyError();
    }
  }
};
