/**
 * Holds current annotation about nearest test/suite/hook
 */

const assert = require('assert');

module.exports = class CurrentAnnotation {
  constructor() {
    this.reset();
  }

  reset() {
    this._only = false;
    this._skip = false;
    this._tags = [];
    this._ignore = [];
    this._if = [];
    this._timeout = 0;
    this._retry = 0;
    this._data = null;
  }

  addOnly() {
    this._only = true;
  }

  addSkip() {
    this._skip = true;
  }

  addTags(tags) {
    if (Array.isArray(tags)) {
      this._tags = this._tags.concat(tags);
    }
  }

  addIgnore(value) {
    const fn = typeof value === 'function' ? value : () => value;
    this._ignore.push(fn);
  }

  addIf(value) {
    const fn = typeof value === 'function' ? value : () => value;
    this._if.push(fn);
  }

  addTimeout(ms) {
    assert(typeof ms === 'number', 'Timeout should be a number');
    this._timeout = ms;
  }

  addRetry(count = 1) {
    this._retry = count;
  }

  addData(data) {
    this._data = data;
  }

  get(target) {
    if (this._isExcludedForTarget(target)) {
      return {
        ignored: true
      };
    } else {
      return {
        target,
        tags: this._tags,
        only: this._only,
        skip: this._skip,
        timeout: this._timeout,
        retry: this._retry,
        data: this._data,
      };
    }
  }

  _isExcludedForTarget(target) {
    return this._ignore.some(fn => fn(target)) || this._if.some(fn => !fn(target));
  }
};
