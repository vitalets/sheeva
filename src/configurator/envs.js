/**
 * Creates and checks envs (environments)
 *
 * @typedef {Object} Env
 * @property {String} id
 * @property {String} label
 * @property {Array} sessions
 * @property {Number} [concurrency]
 */

module.exports = class Envs {
  constructor(config) {
    this._config = config;
    this._envs = null;
  }

  create() {
    this._createFromConfig();
    this._filter();
    this._assertCount();
    this._assertIds();
    this._setLabels();
    this._setSessions();
    return this._envs;
  }

  _createFromConfig() {
    this._envs = this._config.createEnvs();
    if (!Array.isArray(this._envs)) {
      throw new Error('createEnvs() should return array');
    }
  }

  _filter() {
    if (this._config.env) {
      this._envs = this._envs.filter(env => this._config.env === env.id);
    }
  }

  _assertCount() {
    if (!this._envs.length) {
      throw new Error('You should provide at least one env');
    }
  }

  _assertIds() {
    const envIds = new Set();
    this._envs.forEach(env => {
      if (!env || !env.id || envIds.has(env.id)) {
        throw new Error('Each env should be object with unique id property');
      }
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
