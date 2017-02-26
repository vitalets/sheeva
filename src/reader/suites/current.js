/**
 * Appends suites/tests/hooks to current suites.
 * Also collects map of fn --> childSuites for next iteration.
 */

const utils = require('../../utils');
const factory = require('./factory');

module.exports = class Current {
  constructor(annotations) {
    this._annotations = annotations;
    this._suites = null;
    this._childFnSuites = null;
  }

  get childFnSuites() {
    return this._childFnSuites;
  }

  /**
   * Sets array of suites to be filled from currently executed `describe` fn
   *
   * @param {Array<Suite>} suites
   */
  set(suites) {
    this._suites = suites;
    this._childFnSuites = new Map();
  }

  addChildSuite(name, fn) {
    this._forEachSuites((parentSuite, annotation) => {
      const options = Object.assign({}, annotation, {name});
      const childSuite = factory.createSuite(options, parentSuite);
      this._annotations.storeInfo(childSuite);
      utils.pushToMap(this._childFnSuites, fn, childSuite);
    });
    this._resetAnnotation();
  }

  addTest(name, fn) {
    this._forEachSuites((parentSuite, annotation) => {
      const options = Object.assign({}, annotation, {name, fn});
      const test = factory.createTest(options, parentSuite);
      this._annotations.storeInfo(test);
    });
    this._resetAnnotation();
  }

  addHook(type, fn) {
    this._forEachSuites((parentSuite, annotation) => {
      const options = Object.assign({}, annotation, {type, fn});
      factory.createHook(options, parentSuite);
    });
    this._resetAnnotation();
  }

  _forEachSuites(iterator) {
    this._suites.forEach(suite => this._callForSuite(suite, iterator));
  }

  _callForSuite(suite, iterator) {
    const annotation = this._annotations.current.get(suite.env);
    if (!annotation.ignored) {
      iterator(suite, annotation);
    }
  }

  _resetAnnotation() {
    this._annotations.current.reset();
  }
};
