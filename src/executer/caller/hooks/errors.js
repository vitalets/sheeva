/**
 * Stores errors in pre/post hooks
 */

module.exports = class Errors {
  constructor() {
    this._preHookError = null;
    this._middleError = null;
    this._postHookError = null;
    this._suite = null;
  }

  get firstError() {
    return this._preHookError || this._middleError || this._postHookError;
  }

  handlePreHookError(suite, error) {
    if (!this._preHookError) {
      this._preHookError = error;
      // todo: find more elegant way to pass suite
      error.suite = suite;
    }
    return Promise.reject(error);
  }

  handlePostHookError(suite, error) {
    this._postHookError = error;
    error.suite = suite;
  }

  handleMiddleError(error) {
    this._middleError = error;
  }
};
