/**
 * Public API available in test files
 */

const BddApi = require('./bdd');
const AnnotationApi = require('./annotation');

module.exports = class Api {
  constructor() {
    this._bddApi = new BddApi();
    this._annotaionApi = new AnnotationApi();
    this._methods = null;
    this._context = null;
  }

  setAppender(appender) {
    this._bddApi.setAppender(appender);
  }

  setAnnotation(annotation) {
    this._annotaionApi.setAnnotation(annotation);
  }

  inject(context) {
    this._context = context;
    this._setMethods();
    this._forEachMethod(method => this._context[method] = this._methods[method]);
  }

  cleanup() {
    this._forEachMethod(method => delete this._context[method]);
    this._context = null;
  }

  _setMethods() {
    this._methods = Object.assign({}, this._bddApi.getMethods(), this._annotaionApi.getMethods());
  }

  _forEachMethod(iterator) {
    Object.keys(this._methods).forEach(iterator);
  }
};
