/**
 * Annotations
 */

const CurrentAnnotation = require('./current');
const Api = require('./api');
const Result = require('./result');

module.exports = class AnnotationsReader {
  constructor() {
    this._currentAnnotation = new CurrentAnnotation();
    this._api = new Api(this._currentAnnotation).getMethods();
    this._result = new Result();
  }

  get current() {
    return this._currentAnnotation;
  }

  get api() {
    return this._api;
  }

  getForEnv(env) {
    return this._result.getForEnv(env);
  }

  storeInfo(item) {
    this._result.processItem(item);
  }
};
