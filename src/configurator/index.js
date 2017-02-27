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
    this._validate();
    this._createEnvs();
  }

  _merge(rawConfig) {
    Object.assign(this._config, defaults, rawConfig);
  }

  _validate() {
    // todo: move to separate fn
    this._config.files = utils.ensureArray(this._config.files);
    this._config.reporters = utils.ensureArray(this._config.reporters);
    this._config.concurrency = parseInt(this._config.concurrency, 10);
    this._config.timeout = parseInt(this._config.timeout, 10);
    this._validateTypes();
  }

  _createEnvs() {
    this._config.envs = new Envs(this._config).create();
  }

  _validateTypes() {
    Object.keys(defaults).forEach(key => {
      const defaultValueType = typeof defaults[key];
      const valueType = typeof this._config[key];
      if (defaultValueType !== valueType) {
        throw new Error(`Config key type mismatch for ${key}`);
      }
    })
  }

  _clear() {
    Object.keys(this._config).forEach(key => delete this._config[key]);
  }
}

module.exports = new Configurator();
