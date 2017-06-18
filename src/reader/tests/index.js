'use strict';

/**
 * Tests structure reader
 */

const state = require('../../state');
const ExtraMap = require('../../utils/extra-map');
const CurrentSuites = require('./current-suites');
const Walker = require('./walker');
const Bdd = require('./api/bdd');
const factory = require('./factory');

module.exports = class TestsReader {
  constructor(annotationsReader) {
    this._topSuitesPerTarget = state.topSuitesPerTarget;
    this._currentSuites = new CurrentSuites(annotationsReader);
    this._api = new Bdd(this._currentSuites, annotationsReader.current).getMethods();
    this._walker = new Walker(this._currentSuites);
    this._topSuitesPerFn = new ExtraMap();
  }

  get api() {
    return this._api;
  }

  addTopSuite(target, name, fn) {
    const topSuite = factory.createSuite({target, name});
    this._topSuitesPerTarget.getOrCreateSet(target).add(topSuite);
    this._topSuitesPerFn.getOrCreateArray(fn).push(topSuite);
  }

  fill() {
    this._walker.fill(this._topSuitesPerFn);
  }

  fillAsync() {
    return this._walker.fillAsync(this._topSuitesPerFn);
  }
};
