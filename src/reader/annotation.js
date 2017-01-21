/**
 * Holds annotation info for nearest test/suite
 */

const utils = require('../utils');

module.exports = class Annotation {
  constructor() {
    this._only = false;
    this._skip = false;
    this._tags = [];
    this._ignore = [];
    this._if = [];
  }

  clear() {
    this._only = false;
    this._skip = false;
    this._tags.length = 0;
    this._ignore.length = 0;
    this._if.length = 0;
  }

  only() {
    this._only = true;
  }

  skip() {
    this._skip = true;
  }

  tags() {
    const tags = [].slice.call(arguments);
    this._tags = this._tags.concat(tags);
  }

  addIgnore(fn) {
    utils.assertFn(fn, '$ignore() should accept function as parameter');
    this._ignore.push(fn);
  }

  addIf(fn) {
    utils.assertFn(fn, '$if() should accept function as parameter');
    this._if.push(fn);
  }

  getOptions(env) {
    return this._isIgnored(env) ? null : this._createOptions();
  };

  _isIgnored(env) {
    return this._ignore.some(fn => fn(env)) || this._if.some(fn => !fn(env));
  }

  _createOptions() {
    return {
      tags: this._tags,
      only: this._only,
      skip: this._skip,
    };
  }
};
