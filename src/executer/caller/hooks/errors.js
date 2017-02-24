/**
 * Stores errors in pre/post hooks
 */

module.exports = class Errors {
  constructor() {
    this._preHookError = null;
    this._middleError = null;
    this._postHookError = null;
  }

  get firstError() {
    return this._preHookError || this._middleError || this._postHookError;
  }

  handlePreHookError(suite, error) {
    if (!this._preHookError) {
      this._preHookError = error;
      this._attachSuiteToError(suite, error);
    }
    return Promise.reject(error);
  }

  handlePostHookError(suite, error) {
    this._postHookError = error;
    this._attachSuiteToError(suite, error);
  }

  handleMiddleError(error) {
    this._middleError = error;
  }

  // todo: find more elegant way to pass suite
  _attachSuiteToError(suite, error) {
    Object.defineProperty(error, 'suite', {
      value: suite
    });
  }
};
