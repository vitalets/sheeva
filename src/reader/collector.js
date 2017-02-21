/**
 * Collects data per env (fileSuites and suites marked with tags, only and skip)
 *
 * @typedef {Object} EnvData
 * @property {Array<Suite>} fileSuites
 * @property {Array<Suite|Test>} only
 * @property {Array<Suite|Test>} skip
 * @property {Map<String, Array<Suite|Test>>} tags
 */

const utils = require('../utils');

module.exports = class Collector {
  constructor() {
    this._envData = new Map();
  }

  /**
   * @returns {Map<Env,EnvData>}
   */
  get envData() {
    return this._envData;
  }

  addFileSuite(suite) {
    this._getEnvData(suite.env).fileSuites.push(suite);
  }

  /**
   * @param {Suite} suite
   * @param {Suite|Test} child
   */
  addChild(suite, child) {
    suite.children.push(child);
    this._setParents(suite, child);
    this._processOnly(child);
    this._processSkip(child);
    this._processTags(child);
  }

  /**
   * @param {Suite} suite
   * @param {Hook} hook
   */
  addHook(suite, hook) {
    suite[hook.type].push(hook);
    this._setParents(suite, hook);
  }

  /**
   * @param {Suite} parent
   * @param {Suite|Test} child
   */
  _setParents(parent, child) {
    child.parents = parent.parents.concat([parent]);
    child.parent = parent;
  }

  _processOnly(item) {
    if (item.only) {
      this._getEnvData(item.env).only.push(item);
    }
  }

  _processSkip(item) {
    if (item.skip) {
      this._getEnvData(item.env).skip.push(item);
    }
  }

  _processTags(item) {
    if (item.tags.length) {
      const map = this._getEnvData(item.env).tags;
      item.tags.forEach(tag => utils.pushToMap(map, tag, item));
    }
  }

  _getEnvData(env) {
    return this._envData.get(env) || this._createEnvData(env);
  }

  _createEnvData(env) {
    const envData = {
      fileSuites: [],
      only: [],
      skip: [],
      tags: new Map(),
    };
    this._envData.set(env, envData);
    return envData;
  }
};
