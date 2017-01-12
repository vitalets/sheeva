/**
 * Appends children and hooks to array of suites.
 * Also collects fnSuites map for next iteration.
 */

const factory = require('./factory');
const meta = require('./meta');
const utils = require('../utils');

module.exports = class Appender {
  constructor(suites) {
    this._suites = suites;
    this._childFnSuites = new Map();
  }

  get childFnSuites() {
    return this._childFnSuites;
  }

  addChildSuite(name, fn) {
    this._addItem((suite, options) => {
      Object.assign(options, {name});
      const childSuite = factory.createSuite(options);
      factory.addChild(suite, childSuite);
      utils.pushToMap(this._childFnSuites, fn, childSuite);
    });
  }

  addChildTest(name, fn) {
    this._addItem((suite, options) => {
      Object.assign(options, {name, fn});
      const childTest = factory.createTest(options);
      factory.addChild(suite, childTest);
    });
  }

  addHook(type, fn) {
    this._addItem(suite => {
      factory.addHook(suite, type, fn);
    });
  }

  _addItem(iterator) {
    this._forEachSuites(iterator);
    meta.clear();
  }

  _forEachSuites(iterator) {
    this._suites.forEach(suite => {
      const options = meta.getOptions(suite.env);
      if (options) {
        options.env = suite.env;
        iterator(suite, options);
      }
    });
  }
};
