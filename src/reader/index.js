/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const api = require('./api');
const builder = require('./builder');
const meta = require('./meta');

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
    this._hasOnly = false;
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
    patterns = Array.isArray(patterns) ? patterns : [patterns];
    this._files = patterns.reduce((res, pattern) => res.concat(glob.sync(pattern)), []);
    exposeApi(global);
    this._readFiles();
    cleanupApi(global);
    this._processOnly();

    // debug
    //const firstSuite = this._envSuites.values().next().value[0];
    //debug.printTree(firstSuite);
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
  _processOnly() {
    if (this._detectOnly()) {
      this._filterOnly();
    }
  }
  _detectOnly() {
    for (let suites of this._envSuites.values()) {
      const hasOnly = suites.some(suite => suite.hasOnly);
      if (hasOnly) {
        this._hasOnly = true;
        break;
      }
    }
    return this._hasOnly;
  }
  _filterOnly() {
    this._envSuites.forEach((suites, env) => {
      suites = suites.filter(extractOnly);
      this._envSuites.set(env, suites);
    });
  }
};

function exposeApi(context) {
  Object.keys(api).forEach(key => context[key] = api[key]);
}

function cleanupApi(context) {
  Object.keys(api).forEach(key => delete context[key]);
}

function extractOnly(suite) {
  if (suite.hasOnly) {
    const childrenWithOnly = suite.children.filter(child => child.only);
    const childrenHasOnly = suite.children.filter(extractOnly);
    suite.children = childrenHasOnly.concat(childrenWithOnly);
    return true;
  } else {
    return false;
  }
}
