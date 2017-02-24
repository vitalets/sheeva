/**
 * Suites structure reader
 */

const CurrentSuites = require('./current');
const Walker = require('./walker');
const Bdd = require('./api/bdd');
const Result = require('./result');

module.exports = class Suites {
  constructor(annotations) {
    this._currentSuites = new CurrentSuites(annotations);
    this._api = new Bdd(this._currentSuites, annotations.current).getMethods();
    this._walker = new Walker(this._currentSuites);
    this._result = new Result();
  }

  get api() {
    return this._api;
  }

  getForEnv(env) {
    return this._result.getForEnv(env);
  }

  addTopSuite(env, name, fn) {
    this._result.addTopSuite(env, name, fn);
  }

  fill() {
    this._walker.fill(this._result.topFnSuites);
  }
};
