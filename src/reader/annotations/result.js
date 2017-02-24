/**
 * Info about annotated items grouped per env
 */

const utils = require('../../utils');

module.exports = class Result {
  constructor() {
    this._data = new Map();
  }

  getForEnv(env) {
    return this._data.get(env) || createEnvData();
  }

  processItem(item) {
    this._processOnly(item);
    this._processSkip(item);
    this._processTags(item);
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
      const existingTags = this._getEnvData(item.env).tags;
      item.tags.forEach(tag => utils.pushToMap(existingTags, tag, item));
    }
  }

  _getEnvData(env) {
    return this._data.get(env) || this._getNewEnvData(env);
  }

  _getNewEnvData(env) {
    const envData = createEnvData();
    this._data.set(env, envData);
    return envData;
  }
};

function createEnvData() {
  return {
    only: [],
    skip: [],
    tags: new Map(),
  };
}
