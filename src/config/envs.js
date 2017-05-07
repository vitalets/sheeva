/**
 * Creates and checks envs (environments)
 *
 * @typedef {Object} Env
 * @property {String} id
 * @property {String} label
 * @property {Number} [concurrency]
 */

const assert = require('assert');

module.exports = class Envs {
  constructor(config) {
    this._config = config;
    this._envs = null;
  }

  create() {
    this._envs = this._config.createEnvs();
    this._assertArray();
    this._filter();
    this._assertLength();
    this._assertIds();
    this._setLabels();
    this._setSessions();
    return this._envs;
  }

  _filter() {
    if (this._config.env) {
      this._envs = this._envs.filter(env => this._config.env === env.id);
    }
  }

  _assertArray() {
    assert(Array.isArray(this._envs), 'createEnvs() should return array');
  }

  _assertLength() {
    assert(this._envs.length, 'You should provide at least one env');
  }

  _assertIds() {
    const envIds = new Set();
    this._envs.forEach(env => {
      assert(env && env.id && !envIds.has(env.id), 'Each env should be an object with unique id property');
      envIds.add(env.id);
    });
  }

  _setLabels() {
    this._envs.forEach(env => {
      env.label = env.label || this._config.createEnvLabel(env);
    });
  }

  _setSessions() {
    this._envs.forEach(env => env.sessions = []);
  }
};
