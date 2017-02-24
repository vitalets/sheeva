/**
 * Filters suites by only
 */

const ExtraSet = require('../utils/extra-set');
const Includer = require('./includer');

module.exports = class Only {
  constructor(envData) {
    this._envData = envData;
    this._files = new ExtraSet();
    this._found = this._find();
  }

  get files() {
    return this._files.toArray();
  }

  get found() {
    return this._found;
  }

  filter() {
    this._updateEnvData();
    this._updateFiles();
  }

  throwNoOnlyError() {
    throw new Error(
      `ONLY is disallowed but found in ${this.files.length} file(s):\n ${this.files.join('\n')}`
    );
  }

  _find() {
    for (let data of this._envData.values()) {
      if (data.only.length > 0) {
        return true;
      }
    }
    return false;
  }

  _updateEnvData() {
    this._envData.forEach(data => {
      data.topSuites = new Includer(data.topSuites).include(data.only);
    });
  }

  _updateFiles() {
    this._envData.forEach(data => {
      data.topSuites.forEach(suite => this._files.add(suite.name));
    });
  }
};
