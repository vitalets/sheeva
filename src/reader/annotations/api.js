'use strict';

/**
 * Annotation API
 */

module.exports = class AnnotationAPI {
  constructor(currentAnnotation) {
    this._currentAnnotation = currentAnnotation;
  }

  getMethods() {
    return {
      $only: () => this._currentAnnotation.addOnly(),
      $skip: () => this._currentAnnotation.addSkip(),
      $tags: this._addTags.bind(this),
      $ignore: fn => this._currentAnnotation.addIgnore(fn),
      $if: fn => this._currentAnnotation.addIf(fn),
      $timeout: ms => this._currentAnnotation.addTimeout(ms),
      $retry: count => this._currentAnnotation.addRetry(count),
      $data: data => this._currentAnnotation.addData(data),
    };
  }

  _addTags() {
    const tags = [].slice.call(arguments);
    this._currentAnnotation.addTags(tags);
  }
};
