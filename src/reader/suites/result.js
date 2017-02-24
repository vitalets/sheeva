/**
 * Top level suites grouped per env
 */

const utils = require('../../utils');
const factory = require('./factory');

module.exports = class Result {
  constructor() {
    this._data = new Map();
    this._topFnSuites = new Map();
  }

  get topFnSuites() {
    return this._topFnSuites;
  }

  getForEnv(env) {
    return this._data.get(env) || [];
  }

  addTopSuite(env, name, fn) {
    const topSuite = factory.createSuite({env, name});
    utils.pushToMap(this._data, env, topSuite);
    utils.pushToMap(this._topFnSuites, fn, topSuite);
  }
};
