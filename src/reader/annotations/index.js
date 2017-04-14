/**
 * Annotations
 */

const {result} = require('../../result');
const CurrentAnnotation = require('./current');
const Api = require('./api');

module.exports = class AnnotationsReader {
  constructor() {
    this._annotationsPerEnv = result.annotationsPerEnv;
    this._currentAnnotation = new CurrentAnnotation();
    this._api = new Api(this._currentAnnotation).getMethods();
  }

  get current() {
    return this._currentAnnotation;
  }

  get api() {
    return this._api;
  }

  /**
   * Store test/suite annotations
   *
   * @param {Test|Suite} item
   */
  store(item) {
    this._processOnly(item);
    this._processSkip(item);
    this._processTags(item);
  }

  _processOnly(item) {
    if (item.only) {
      this._annotationsPerEnv.get(item.env).only.add(item);
    }
  }

  _processSkip(item) {
    if (item.skip) {
      this._annotationsPerEnv.get(item.env).skip.add(item);
    }
  }

  _processTags(item) {
    if (item.tags.length) {
      const existingTags = this._annotationsPerEnv.get(item.env).tags;
      item.tags.forEach(tag => existingTags.getOrCreateSet(tag).add(item));
    }
  }
};
