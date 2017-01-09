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
   * @param {Config} options.config
   */
  constructor(options) {
    // map of env --> suites tree structure
    this._envSuites = new Map(options.envs.map(env => [env, []]));
    this._files = [];
    this._only = null;
    this._config = options.config;
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
    this._expandPatterns();
    exposeApi(global);
    this._readFiles();
    cleanupApi(global);
    this._processOnly();
  }
  _expandPatterns() {
    this._files = this._config.files.reduce((res, pattern) => res.concat(glob.sync(pattern)), []);
  }
  _readFiles() {
    this._files.forEach(file => this._readFile(file));
  }
  _readFile(file) {
    const suites = [];
    this._envSuites.forEach((envSuites, env) => {
      const rootSuite = new Suite({name: file, isFile: true, env});
      envSuites.push(rootSuite);
      suites.push(rootSuite);
    });
    const fn = () => loadFile(file);
    builder.fillSuites(suites, fn);
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
function loadFile(file) {
  require(path.resolve(file));
}

function exposeApi(context) {
  Object.keys(api).forEach(key => context[key] = api[key]);
}

function cleanupApi(context) {
  Object.keys(api).forEach(key => delete context[key]);
}


