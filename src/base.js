/**
 * Base class for other classes that need basic common props:
 * - config
 * - reporter
 */

module.exports = class Base {
  constructor() {
    this._config = null;
    this._reporter = null;
  }

  setBaseProps(parent) {
    // getting private props directly is better here (instead of making public getters)
    this._config = parent._config;
    this._reporter = parent._reporter;
    return this;
  }

  _emit(event, data = {}) {
    this._reporter.handleEvent(event, data);
  }
};
