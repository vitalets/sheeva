/**
 * Filters suites by skip
 */

const Cleaner = require('./cleaner');

module.exports = class Skip {
  constructor(envData) {
    this._envData = envData;
  }

  filter() {
    this._envData.forEach(data => {
      data.roots = new Cleaner(data.roots).removeItems(data.skip);
    });
  }
};
