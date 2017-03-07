/**
 * Holds current annotation about nearest test/suite/hook
 */

const {assertType} = require('../../utils/assert');

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

  addIgnore(fn) {
    assertType(fn, 'function', '$ignore() should accept function as parameter');
    this._ignore.push(fn);
  }

  addIf(fn) {
    assertType(fn, 'function', '$if() should accept function as parameter');
    this._if.push(fn);
  }

  addTimeout(ms) {
    assertType(ms, 'number', 'Timeout should be number');
    this._timeout = ms;
  }

  addRetry(count = 1) {
    this._retry = count;
  }

  get(env) {
    if (this._isIgnored(env)) {
      return {
        ignored: true
      };
    } else {
      return {
        env,
        tags: this._tags,
        only: this._only,
        skip: this._skip,
        timeout: this._timeout,
        retry: this._retry,
      };
    }
  }

  _isIgnored(env) {
    return this._ignore.some(fn => fn(env)) || this._if.some(fn => !fn(env));
  }
};
