/**
 * Read test files into suites structure
 *
 * @typedef {Object} EnvData
 * @property {Array<Suite>} topSuites
 * @property {Array<Suite|Test>} only
 * @property {Array<Suite|Test>} skip
 * @property {Map<String, Array<Suite|Test>>} tags
 */

const path = require('path');
const glob = require('glob');
const {config} = require('../configurator');
const PropsInjector = require('../utils/props-injector');
const Annotations = require('./annotations');
const Suites = require('./suites');

module.exports = class Reader {
  /**
   * Constructor
   */
  constructor() {
    this._files = [];
    this._context = global;
    this._annotations = new Annotations();
    this._suites = new Suites(this._annotations);
    this._propsInjector = new PropsInjector();
    this._data = new Map();
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
  get data() {
    return this._data;
  }

  /**
   * Reads patterns and creates suite tree
   */
  read() {
    this._expandPatterns();
    this._createTopSuites();
    this._injectApi();
    this._readFiles();
    this._cleanupApi();
    this._mergeResult();
  }

  _expandPatterns() {
    this._files = config.files.reduce((res, pattern) => {
      const files = expandPattern(pattern);
      return res.concat(files);
    }, []);
  }

  _createTopSuites() {
    this._files.forEach(file => {
      const fn = () => readFile(file);
      config.envs.forEach(env => this._suites.addTopSuite(env, file, fn));
    });
  }

  _injectApi() {
    const methods = Object.assign({}, this._annotations.api, this._suites.api);
    this._propsInjector.inject(this._context, methods);
  }

  _readFiles() {
    this._suites.fill();
  }

  _cleanupApi() {
    this._propsInjector.cleanup();
  }

  _mergeResult() {
    config.envs.forEach(env => {
      const topSuites = this._suites.getForEnv(env);
      const annotationData = this._annotations.getForEnv(env);
      const envData = Object.assign({topSuites}, annotationData);
      this._data.set(env, envData);
    });
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


