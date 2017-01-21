/**
 * Executes function to fill array of suites and collect map of child fn --> suites
 */

const utils = require('../utils');
const creator = require('./creator');

module.exports = class Appender {
  constructor(collector, annotation, suites) {
    this._collector = collector;
    this._annotaion = annotation;
    this._suites = suites;
    this._childFnSuites = new Map();
  }

  get childFnSuites() {
    return this._childFnSuites;
  }

  addChildSuite({name, fn, skip, only}) {
    this._processSkipOnly(skip, only);
    this._addItem((suite, options) => {
      Object.assign(options, {name});
      const childSuite = creator.createSuite(options);
      this._collector.addChild(suite, childSuite);
      utils.pushToMap(this._childFnSuites, fn, childSuite);
    });
  }

  addChildTest({name, fn, skip, only}) {
    this._processSkipOnly(skip, only);
    this._addItem((suite, options) => {
      Object.assign(options, {name, fn});
      const childTest = creator.createTest(options);
      this._collector.addChild(suite, childTest);
    });
  }

  addHook(type, fn) {
    this._addItem(suite => {
      this._collector.addHook(suite, type, fn);
    });
  }

  _addItem(iterator) {
    this._forEachSuites(iterator);
    this._annotaion.clear();
  }

  _forEachSuites(iterator) {
    this._suites.forEach(suite => {
      const options = this._annotaion.getOptions(suite.env);
      if (options) {
        options.env = suite.env;
        iterator(suite, options);
      }
    });
  }

  _processSkipOnly(skip, only) {
    if (skip) {
      this._annotaion.skip();
    }
    if (only) {
      this._annotaion.only();
    }
  }
};
