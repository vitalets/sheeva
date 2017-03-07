/**
 * Top level suites grouped per env
 */

const ExtraMap = require('../../utils/extra-map');
const factory = require('./factory');

module.exports = class Result {
  constructor() {
    this._data = new ExtraMap();
    this._topFnSuites = new ExtraMap();
  }

  get topFnSuites() {
    return this._topFnSuites;
  }

  getForEnv(env) {
    return this._data.get(env) || [];
  }

  addTopSuite(env, name, fn) {
    const topSuite = factory.createSuite({env, name});
    this._data.getOrCreateArray(env).push(topSuite);
    this._topFnSuites.getOrCreateArray(fn).push(topSuite);
  }
};
