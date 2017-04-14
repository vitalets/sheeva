/**
 * Suites structure reader
 */

const {result} = require('../../result');
const ExtraMap = require('../../utils/extra-map');
const CurrentSuites = require('./current');
const Walker = require('./walker');
const Bdd = require('./api/bdd');
const factory = require('./factory');

module.exports = class SuitesReader {
  constructor(annotationsReader) {
    this._topSuitesPerEnv = result.topSuitesPerEnv;
    this._currentSuites = new CurrentSuites(annotationsReader);
    this._api = new Bdd(this._currentSuites, annotationsReader.current).getMethods();
    this._walker = new Walker(this._currentSuites);
    this._topSuitesPerFn = new ExtraMap();
  }

  get api() {
    return this._api;
  }

  addTopSuite(env, name, fn) {
    const topSuite = factory.createSuite({env, name});
    this._topSuitesPerEnv.getOrCreateSet(env).add(topSuite);
    this._topSuitesPerFn.getOrCreateArray(fn).push(topSuite);
  }

  fill() {
    this._walker.fill(this._topSuitesPerFn);
  }
};
