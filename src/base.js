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
    const {config, reporter} = parent.getBaseProps();
    this._config = config;
    this._reporter = reporter;
    return this;
  }

  getBaseProps() {
    return {
      config: this._config,
      reporter: this._reporter,
    };
  }

  _emit(event, data = {}) {
    this._reporter.handleEvent(event, data);
  }
};
