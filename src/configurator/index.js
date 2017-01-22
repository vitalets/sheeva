/**
 * Creates config
 *
 * @typedef {Object} Config
 */

const utils = require('../utils');
const defaults = require('./defaults');
const Envs = require('./envs');

module.exports = class Configurator {
  /**
   * Constructor
   *
   * @param {Object} config
   */
  constructor(config) {
    this._config = Object.assign({}, defaults, config);
    this._envs = new Envs(this._config);
  }

  get config() {
    return this._config;
  }

  /**
   *
   * @returns {Config}
   */
  run() {
    this._ensurePropTypes();
    this._createEnvs();
  }

  _createEnvs() {
    this._config.envs = this._envs.create();
  }

  _ensurePropTypes() {
    this._config.files = utils.toArray(this._config.files);
    this._config.reporters = utils.toArray(this._config.reporters);
  }
};
