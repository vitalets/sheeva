/**
 * Filters suites by skip
 */

const Remover = require('./remover');

module.exports = class Skip {
  constructor(envData) {
    this._envData = envData;
  }

  filter() {
    this._envData.forEach(data => {
      data.fileSuites = new Remover(data.fileSuites).remove(data.skip);
    });
  }
};
