/**
 * Singleton config, validates and extends passed config with defaults.
 */

const assert = require('assert');
const utils = require('../utils');
const defaults = require('./defaults');
const Targets = require('./targets');

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
    this._validateFiles();
    this._createTargets();
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
      assert(defaults.hasOwnProperty(key), `Unknown config option: ${key}`);
      const valueType = typeof this._config[key];
      const defaultValueType = typeof defaults[key];
      const msg = `Incorrect config option type for: ${key} (expected ${defaultValueType}, got ${valueType})`;
      assert.equal(valueType, defaultValueType, msg);
    });
  }

  _validateFiles() {
    assert(this._config.files.length, `Empty config.files`);
    this._config.files.forEach(file => {
      if (typeof file === 'string') return;
      if (file && file.name) return;
      throw new Error(`Files should be array of String or Object {name, content}, got ${JSON.stringify(file)}`);
    });
  }

  _createTargets() {
    this._config.targets = new Targets(this._config).create();
  }

  _clear() {
    Object.keys(this._config).forEach(key => delete this._config[key]);
  }
}

module.exports = new Configurator();
