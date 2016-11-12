/**
 * Utils
 */

/**
 * Returns object that can be resolved/rejected after calling "call"
 */
exports.Promised = class Promised {
  call(fn) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      return fn();
    });
  }
};
