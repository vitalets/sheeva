/**
 * Filters suites by skip
 */

const ExtraSet = require('../utils/extra-set');
const Excluder = require('./excluder');

module.exports = class Skip {
  constructor(envData) {
    this._envData = envData;
    this._files = new ExtraSet();
    this._suites = new ExtraSet();
    this._tests = new ExtraSet();
  }

  get files() {
    return this._files.toArray();
  }

  get suites() {
    return this._suites.toArray();
  }

  get tests() {
    return this._tests.toArray();
  }

  filter() {
    this._updateEnvData();
    this._updateFiles();
    this._updateSuitesAndTests();
  }

  _updateEnvData() {
    this._envData.forEach(data => {
      data.fileSuites = new Excluder(data.fileSuites).exclude(data.skip);
    });
  }

  _updateFiles() {
    this._envData.forEach(data => {
      data.skip.forEach(item => {
        const fileName = item.parents[0].name;
        this._files.add(fileName);
      });
    });
  }

  _updateSuitesAndTests() {
    this._envData.forEach(data => {
      data.skip.forEach(item => {
        const fullName = getFullName(item);
        const set = item.children ? this._suites : this._tests;
        set.add(fullName);
      });
    });
  }
};

function getFullName(item) {
  return item.parents
    .concat([item.name])
    .map(parent => parent.name)
    .join('');
}
