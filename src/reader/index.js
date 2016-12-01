/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const api = require('./api');
const builder = require('./builder');
const meta = require('./meta');
const Only = require('./only');

module.exports = class Reader {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.envs
   * @param {Array} [options.tags]
   */
  constructor(options) {
    this._envs = options.envs;
    // map that contains env => array of suites
    this._envSuites = new Map();
    this._envs.forEach(env => this._envSuites.set(env, []));
    this._only = new Only();
    meta.setTags(options.tags);
  }
  get files() {
    return this._files;
  }
  get envSuites() {
    return this._envSuites;
  }
  get hasOnly() {
    return this._hasOnly;
  }
  read(patterns) {
    this._setFiles(patterns);
    exposeApi(global);
    this._readFiles();
    cleanupApi(global);
    this._only.process(this._envSuites);
  }
  _setFiles(patterns) {
    patterns = Array.isArray(patterns) ? patterns : [patterns];
    this._files = patterns.reduce((res, pattern) => res.concat(glob.sync(pattern)), []);
  }
  _readFiles() {
    this._files.forEach(file => {
      const suites = this._envs.map(env => new Suite({
        name: file,
        isFile: true,
        env
      }));
      const fn = () => require(path.resolve(file));
      builder.fillSuites(suites, fn);
      suites.forEach(this._addSuiteToEnv, this);
    });
  }
  _addSuiteToEnv(suite) {
    const envSuites = this._envSuites.get(suite.env);
    envSuites.push(suite);
  }
};

function exposeApi(context) {
  Object.keys(api).forEach(key => context[key] = api[key]);
}

function cleanupApi(context) {
  Object.keys(api).forEach(key => delete context[key]);
}


