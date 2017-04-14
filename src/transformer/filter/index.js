/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const Only = require('./only');
const Skip = require('./skip');
const Tags = require('./tags');

module.exports = function () {
  const only = new Only();
  if (only.found) {
    only.filter();
  } else {
    new Tags().filter();
    new Skip().filter();
  }
};

/*
module.exports = class Filter {
  // constructor() {
  //   this._envData = null;
  //   this._only = null;
  //   this._skip = null;
  //   this._tags = null;
  // }

  // get result() {
  //   return this._envData;
  // }
  //
  // get meta() {
  //   return {
  //     only: {
  //       files: this._only.files
  //     },
  //     skip: {
  //       files: this._skip.files,
  //       suites: this._skip.suites,
  //       tests: this._skip.tests,
  //     }
  //   };
  // }

  run() {
    this._init();
    this._filter();
  }

  _init() {
    this._only = new Only();
    this._skip = new Skip();
    this._tags = new Tags();
  }

  _filter() {
    if (this._only.found) {
      this._only.filter();
    } else {
      this._tags.filter();
      this._skip.filter();
    }
  }

  _filterTags() {
    const tags = new Tags();
    tags.filter();
  }
};
*/
