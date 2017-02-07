/**
 * Filters suites by skip
 */

const Excluder = require('./excluder');

module.exports = class Skip {
  constructor(envData) {
    this._envData = envData;
  }

  filter() {
    this._excludeSkipped();
  }

  _excludeSkipped() {
    this._envData.forEach(data => {
      data.fileSuites = new Excluder(data.fileSuites).exclude(data.skip);
    });
  }
};
