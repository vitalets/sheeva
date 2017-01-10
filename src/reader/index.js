/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const api = require('./api');
const meta = require('./meta');
const Only = require('./only');

module.exports = class Reader {
  /**
   * Constructor
   *
   * @param {Object} options
   * @param {Array} options.envs
   * @param {Config} options.config
   */
  constructor(options) {
    this._envs = options.envs;
    this._config = options.config;
    this._envSuites = new Map();
    this._fileSuites = new Map();
    this._files = [];
    this._only = null;
    this._context = global;
    meta.setTags(this._config.tags);
  }
  get files() {
    return this._files;
  }
  get envSuites() {
    return this._envSuites;
  }
  /**
   * Array of files where ONLY found
   *
   * @returns {Array<String>}
   */
  get onlyFiles() {
    return this._only.files;
  }
  read() {
    this._expandFilePatterns();
    this._createRootSuites();
    this._exposeApi();
    this._readFiles();
    this._cleanupApi();
    this._processOnly();
  }
  _expandFilePatterns() {
    this._files = this._config.files.reduce((res, pattern) => res.concat(glob.sync(pattern)), []);
  }
  _createRootSuites() {
    this._files.forEach(file => {
      this._envs.forEach(env => {
        const rootSuite = new Suite({name: file, isFile: true, env});
        pushToMap(this._envSuites, env, rootSuite);
        pushToMap(this._fileSuites, file, rootSuite);
      });
    });
  }
  _exposeApi() {
    api.expose(this._context);
  }
  _readFiles() {
    this._fileSuites.forEach((suites, file) => {
      const fn = () => readFile(file);
      api.apply(fn, suites);
    });
  }
  _cleanupApi() {
    api.cleanup(this._context);
  }
  _processOnly() {
    this._only = new Only(this._envSuites).process();
    if (this._only.files.length && this._config.noOnly) {
      const filesCount = this._only.files.length;
      const filesList = this._only.files.join('\n');
      throw new Error(`ONLY is disallowed but found in ${filesCount} file(s):\n ${filesList}`);
    }
  }
};

// todo: move to separate module for browser
function readFile(file) {
  require(path.resolve(file));
}

function pushToMap(map, key, item) {
  if (map.has(key)) {
    map.get(key).push(item);
  } else {
    map.set(key, [item]);
  }
}
