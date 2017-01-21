/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const Cleaner = require('./cleaner');

module.exports = class Filter {
  constructor(envData) {
    this._envData = envData;
    this._onlyFiles = [];
  }

  get envData() {
    return this._envData;
  }

  get onlyFiles() {
    return this._onlyFiles;
  }

  /**
   * Applies filter
   */
  run() {
    if (this._hasOnly()) {
      this._processOnly();
      this._fillOnlyFiles();
    } else {
      this._processTags();
      this._processSkip();
    }
    return this;
  }

  _processOnly() {
    this._envData.forEach(data => {
      data.roots = new Cleaner(data.roots).keepItems(data.only);
    });
  }

  _hasOnly() {
    for (let data of this._envData.values()) {
      if (data.only.length > 0) {
        return true;
      }
    }
    return false;
  }

  _processTags() {
    // todo
  }

  _processSkip() {
    this._envData.forEach(data => {
      data.roots = new Cleaner(data.roots).removeItems(data.skip);
    });
  }

  _fillOnlyFiles() {
    this._envData.forEach(data => {
      data.roots.forEach(suite => {
        const file = suite.name;
        if (this._onlyFiles.indexOf(file) === -1) {
          this._onlyFiles.push(file);
        }
      });
    });
  }
};
