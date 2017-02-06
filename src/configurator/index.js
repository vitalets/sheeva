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
    this._ensurePropTypes();
    this._createEnvs();
  }

  _createEnvs() {
    this._config.envs = new Envs(this._config).create();
  }

  _ensurePropTypes() {
    this._config.files = utils.ensureArray(this._config.files);
    this._config.reporters = utils.ensureArray(this._config.reporters);
  }

  _merge(rawConfig) {
    Object.assign(this._config, defaults, rawConfig);
  }

  _clear() {
    Object.keys(this._config).forEach(key => delete this._config[key]);
  }
}

module.exports = new Configurator();
