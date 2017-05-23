/**
 * Creates and checks targets (targets)
 *
 * @typedef {Object} Target
 * @property {String} id
 * @property {String} label
 * @property {Number} [concurrency]
 */

const assert = require('assert');

module.exports = class Targets {
  constructor(config) {
    this._config = config;
    this._targets = null;
  }

  create() {
    this._targets = this._config.createTargets();
    this._assertArray();
    this._filter();
    this._assertLength();
    this._assertIds();
    this._setLabels();
    this._setSessions();
    return this._targets;
  }

  _filter() {
    if (this._config.target) {
      this._targets = this._targets.filter(target => this._config.target === target.id);
    }
  }

  _assertArray() {
    assert(Array.isArray(this._targets), 'createTargets() should return array');
  }

  _assertLength() {
    assert(this._targets.length, 'You should provide at least one target');
  }

  _assertIds() {
    const targetIds = new Set();
    this._targets.forEach(target => {
      assert(target && target.id, 'Each target should have id property');
      assert(!targetIds.has(target.id), 'Each target id should be unique');
      targetIds.add(target.id);
    });
  }

  _setLabels() {
    this._targets.forEach(target => {
      target.label = target.label || this._config.createTargetLabel(target);
    });
  }

  _setSessions() {
    this._targets.forEach(target => target.sessions = []);
  }
};
