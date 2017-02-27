/**
 * Transforms tests:
 * - filters only, skip, tags
 * - flatten and sort
 */

const Filter = require('./filter');
const Flatten = require('./flatten');

module.exports = class Transformer {
  constructor() {
    this._result = null;
    this._filter = new Filter();
    this._flatten = new Flatten();
  }

  get result() {
    return this._result;
  }

  get meta() {
    return this._filter.meta;
  }

  transform(envData) {
    this._filter.run(envData);
    this._flatten.run(this._filter.result);
    this._result = this._flatten.result;
  }
};
