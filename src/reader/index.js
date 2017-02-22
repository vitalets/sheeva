/**
 * Read test files into suites structure
 *
 * @typedef {Object} EnvData
 * @property {Array<Suite>} roots
 * @property {Array<Suite|Test>} only
 * @property {Array<Suite|Test>} skip
 * @property {Map<String, Array<Suite|Test>>} tags
 */

const path = require('path');
const glob = require('glob');
const utils = require('../utils');
const {config} = require('../configurator');
const factory = require('./factory');
const Collector = require('./collector');
const Appender = require('./appender');
const Annotator = require('./annotator');
const Api = require('./api');

module.exports = class Reader {
  /**
   * Constructor
   */
  constructor() {
    this._files = [];
    this._fnSuites = new Map();
    this._context = global;
    this._collector = new Collector();
    this._annotator = new Annotator();
    this._api = new Api();
    this._appender = null;
  }

  /**
   * Returns processed files
   *
   * @returns {Array}
   */
  get files() {
    return this._files;
  }

  /**
   * @returns {Map<Env,EnvData>}
   */
  get envData() {
    return this._collector.envData;
  }

  /**
   * Reads patterns and creates suite tree
   */
  read() {
    this._expandPatterns();
    this._createFileSuites();
    this._injectApi();
    this._readFiles();
    this._cleanupApi();
  }

  _expandPatterns() {
    this._files = config.files.reduce((res, pattern) => {
      const files = expandPattern(pattern);
      return res.concat(files);
    }, []);
  }

  _createFileSuites() {
    this._files.forEach(file => {
      const fn = () => readFile(file);
      config.envs.forEach(env => {
        const fileSuite = factory.createSuite({name: file, env});
        utils.pushToMap(this._fnSuites, fn, fileSuite);
        this._collector.addFileSuite(fileSuite);
      });
    });
  }

  _injectApi() {
    this._api.setAnnotator(this._annotator);
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
    this._appender = new Appender(this._collector, this._annotator, suites);
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
