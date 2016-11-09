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
    this._envSuites = new Map();
    this._envs.forEach(env => this._envSuites.set(env, []));
    meta.setTags(options.tags);
  }
  read(context, pattern) {
    this._files = glob.sync(pattern);
    exposeApi(context);
    this._readFiles();
    cleanupApi(context);
    if (this._hasOnly()) {
      this._processOnly();
    }
  }
  _readFiles() {
    this._files.forEach(file => {
      const suites = this._envs.map(env => new Suite({name: file, env}));
      const fn = () => require(path.resolve(file));
      builder.fillSuites(suites, fn);
      suites.forEach(this._addSuiteToEnv, this);
    });
  }
  _addSuiteToEnv(suite) {
    const envSuites = this._envSuites.get(suite.env);
    envSuites.push(suite);
  }
  _hasOnly() {
    for (let suites of this._envSuites.values()) {
      const hasOnly = suites.some(suite => suite.hasOnly);
      if (hasOnly) {
        return true;
      }
    }
    return false;
  }
  _processOnly() {
    this._envSuites.forEach((suites, env) => {
      suites = suites.filter(filterOnly);
      this._envSuites.set(env, suites);
    });
  }
  get files() {
    return this._files;
  }
  get envSuites() {
    return this._envSuites;
  }
};

function exposeApi(context) {
  Object.keys(api).forEach(key => context[key] = api[key]);
}

function cleanupApi(context) {
  Object.keys(api).forEach(key => delete context[key]);
}

function filterOnly(suite) {
  if (suite.hasOnly) {
    suite.tests = suite.tests.filter(test => test.only);
    const onlySubSuites = suite.suites.filter(subSuite => subSuite.only);
    const hasOnlySubSuites = suite.suites.filter(filterOnly);
    suite.suites = onlySubSuites.concat(hasOnlySubSuites);
    return true;
  } else {
    return false;
  }
}
