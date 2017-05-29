'use strict';

/**
 * BDD API:
 * - describe
 * - it
 * - before
 * - after
 * - beforeEach
 * - afterEach
 */

module.exports = class Bdd {
  constructor(currentSuites, currentAnnotation) {
    this._currentSuites = currentSuites;
    this._currentAnnotation = currentAnnotation;
  }

  getMethods() {
    return Object.assign(
      {},
      this._describe(),
      this._it(),
      this._hooks()
    );
  }

  _describe() {
    const methods = {};
    methods.describe = (name, fn) => {
      this._currentSuites.addChildSuite(name, fn);
    };
    methods.ddescribe = methods.describe.only = (name, fn) => {
      this._currentAnnotation.addOnly();
      this._currentSuites.addChildSuite(name, fn);
    };
    methods.xdescribe = methods.describe.skip = (name, fn) => {
      this._currentAnnotation.addSkip();
      this._currentSuites.addChildSuite(name, fn);
    };
    return methods;
  }

  _it() {
    const methods = {};
    methods.it = (name, fn) => {
      this._currentSuites.addTest(name, fn);
    };
    methods.iit = methods.it.only = (name, fn) => {
      this._currentAnnotation.addOnly();
      this._currentSuites.addTest(name, fn);
    };
    methods.xit = methods.it.skip = (name, fn) => {
      this._currentAnnotation.addSkip();
      this._currentSuites.addTest(name, fn);
    };
    return methods;
  }

  _hooks() {
    const methods = {};
    methods.before = methods.beforeAll = fn => this._currentSuites.addHook('before',     fn);
    methods.beforeEach                 = fn => this._currentSuites.addHook('beforeEach', fn);
    methods.after = methods.afterAll   = fn => this._currentSuites.addHook('after',      fn);
    methods.afterEach                  = fn => this._currentSuites.addHook('afterEach',  fn);
    return methods;
  }
};
