/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const factory = require('./factory');
const api = require('./api');
const utils = require('../utils');

module.exports = class Reader {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.envs
   */
  constructor(options) {
    this._envs = options.envs;
    this._envSuites = new Map();
    this._fnSuites = new Map();
    this._files = [];
    this._context = global;
  }
  get files() {
    return this._files;
  }
  get envSuites() {
    return this._envSuites;
  }
  read(patterns) {
    this._expandPatterns(patterns);
    this._createRootSuites();
    this._injectApi();
    this._readFiles();
    this._cleanupApi();
  }
  _expandPatterns(patterns) {
    this._files = patterns.reduce((res, pattern) => {
      const files = glob.sync(pattern);
      return res.concat(files);
    }, []);
  }
  _createRootSuites() {
    this._files.forEach(file => {
      const fn = () => readFile(file);
      this._envs.forEach(env => {
        const rootSuite = factory.createSuite({name: file, env});
        utils.pushToMap(this._envSuites, env, rootSuite);
        utils.pushToMap(this._fnSuites, fn, rootSuite);
      });
    });
  }
  _injectApi() {
    api.inject(this._context);
  }
  _readFiles() {
    api.fillSuites(this._fnSuites);
  }
  _cleanupApi() {
    api.cleanup(this._context);
  }
};

// todo: move to separate module for browser
function readFile(file) {
  require(path.resolve(file));
}
