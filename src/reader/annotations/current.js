/**
 * Holds current annotation about nearest test/suite/hook
 */

const utils = require('../../utils');

module.exports = class CurrentAnnotation {
  constructor() {
    this._only = false;
    this._skip = false;
    this._tags = [];
    this._ignore = [];
    this._if = [];
    this._timeout = 0;
  }

  clear() {
    this._only = false;
    this._skip = false;
    this._tags.length = 0;
    this._ignore.length = 0;
    this._if.length = 0;
    this._timeout = 0;
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
    utils.assertFn(fn, '$ignore() should accept function as parameter');
    this._ignore.push(fn);
  }

  addIf(fn) {
    utils.assertFn(fn, '$if() should accept function as parameter');
    this._if.push(fn);
  }

  addTimeout(ms) {
    utils.assertNotEmpty(ms, 'Zero timeout is bad idea');
    this._timeout = ms;
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
      };
    }
  }

  _isIgnored(env) {
    return this._ignore.some(fn => fn(env)) || this._if.some(fn => !fn(env));
  }
};
