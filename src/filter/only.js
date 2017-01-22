/**
 * Filters suites by only
 */

const Cleaner = require('./cleaner');

module.exports = class Only {
  constructor(envData) {
    this._envData = envData;
    this._files = [];
    this._exists = this._check();
  }

  get files() {
    return this._files;
  }

  get exists() {
    return this._exists;
  }

  filter() {
    this._clean();
    this._fillFiles();
  }

  throwNoOnlyError() {
    throw new Error(
      `ONLY is disallowed but found in ${this._files.length} file(s):\n ${this._files.join('\n')}`
    );
  }

  _check() {
    for (let data of this._envData.values()) {
      if (data.only.length > 0) {
        return true;
      }
    }
    return false;
  }

  _clean() {
    this._envData.forEach(data => {
      data.roots = new Cleaner(data.roots).keepItems(data.only);
    });
  }

  _fillFiles() {
    this._envData.forEach(data => {
      data.roots.forEach(suite => {
        const file = suite.name;
        if (this._files.indexOf(file) === -1) {
          this._files.push(file);
        }
      });
    });
  }
};
