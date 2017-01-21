/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const utils = require('../utils');
const creator = require('./creator');
const Collector = require('./collector');
const Appender = require('./appender');
const Annotation = require('./annotation');
const Api = require('./api');

module.exports = class Reader {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.envs
   */
  constructor(options) {
    this._envs = options.envs;
    this._files = [];
    this._fnSuites = new Map();
    this._context = global;
    this._collector = new Collector();
    this._annotation = new Annotation();
    this._api = new Api();
    this._appender = null;
  }
  get files() {
    return this._files;
  }
  get envData() {
    return this._collector.envData;
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
      const files = expandPattern(pattern);
      return res.concat(files);
    }, []);
  }
  _createRootSuites() {
    this._files.forEach(file => {
      const fn = () => readFile(file);
      this._envs.forEach(env => {
        const suite = creator.createSuite({name: file, env});
        utils.pushToMap(this._fnSuites, fn, suite);
        this._collector.addRootSuite(suite);
      });
    });
  }
  _injectApi() {
    this._api.setAnnotation(this._annotation);
    this._api.inject(this._context);
  }
  _readFiles() {
    this._fillSuitesRecursive(this._fnSuites);
  }
  _fillSuitesRecursive(fnSuites) {
    fnSuites.forEach((suites, fn) => {
      this._fillSuites(suites, fn);
      this._fillChildSuites();
    });
  }
  _fillSuites(suites, fn) {
    this._appender = new Appender(this._collector, this._annotation, suites);
    this._api.setAppender(this._appender);
    fn();
  }
  _fillChildSuites() {
    this._fillSuitesRecursive(this._appender.childFnSuites);
  }
  _cleanupApi() {
    this._api.cleanup();
  }
};

// todo: move to separate module for browser
function readFile(file) {
  require(path.resolve(file));
}

// todo: move to separate module for browser
function expandPattern(pattern) {
  return glob.sync(pattern);
}
