/**
 * Checks config, extends with defaults and creates envs.
 */

const utils = require('../utils');
const defaults = require('./defaults');
const Envs = require('./envs');

class Configurator {
  /**
   * Constructor
   */
  constructor() {
    this._config = {};
  }

  get config() {
    return this._config;
  }

  init(rawConfig) {
    this._clear();
    this._merge(rawConfig);
    this._fixTypes();
    this._validateProps();
    this._createEnvs();
  }

  _merge(rawConfig) {
    Object.assign(this._config, defaults, rawConfig);
  }

  _fixTypes() {
    this._config.files = utils.ensureArray(this._config.files);
    this._config.reporters = utils.ensureArray(this._config.reporters);
    this._config.concurrency = parseInt(this._config.concurrency, 10);
    this._config.timeout = parseInt(this._config.timeout, 10);
  }

  _validateProps() {
    Object.keys(this._config).forEach(key => {
      utils.assertOk(defaults.hasOwnProperty(key), `Unknown config option: ${key}`);
      const valueType = typeof this._config[key];
      const defaultValueType = typeof defaults[key];
      const msg = `Incorrect config option type for: ${key} (expected ${defaultValueType}, got ${valueType})`;
      utils.assertOk(valueType === defaultValueType, msg);
    });
  }

  _createEnvs() {
    this._config.envs = new Envs(this._config).create();
  }

  _clear() {
    Object.keys(this._config).forEach(key => delete this._config[key]);
  }
}

module.exports = new Configurator();
