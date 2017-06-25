'use strict';

/**
 * Runs specified code in fresh instance of Sheeva
 */

require('promise.prototype.finally.err').shim();
require('./globals');
const objectPath = require('object-path').withInheritedProps;
const getSheeva = require('./get-sheeva');
const Reporter = require('./reporter');

const BASE_CONFIG = {
  concurrency: 1,
  splitRunningSuites: false,
  createTargets: function () {
    return [{id: 'target1'}];
  },
};

const DEFAULT_INCLUDE = ['TEST_END'];

module.exports = class SubSheevaRunner {
  /**
   * Constructor
   *
   * @param {String|Array} code
   * @param {Object} options
   * @param {Number} [options.delay]
   * @param {Object} [options.config]
   * @param {Array} [options.include]
   * @param {Array} [options.exclude]
   * @param {Function} [options.processOutput]
   * @param {Array|Object} [options.keys] which keys extract to final output
   * @param {String} [options.output='flatReport'] what is to output: 'flatReport', 'treeReport', 'rawReport', 'result'
   * @returns {Promise}
   */
  constructor(code, options) {
    this._code = Array.isArray(code) ? code : [code];
    this._options = options;
    this._files = this._createFilesArray();
    this._reporter = this._createReporter();
    this._config = this._createConfig();
    this._sheeva = null;
    this._output = null;
  }

  run() {
    const Sheeva = getSheeva();
    this._sheeva = new Sheeva(this._config);
    return this._sheeva.run()
      .then(result => this._setOutput(result))
      .catch(e => this._attachOutputToError(e));
  }

  _createReporter() {
    let {include, exclude} = this._options;
    if (!include && !exclude) {
      include = DEFAULT_INCLUDE;
    }
    return new Reporter({include, exclude});
  }

  _createFilesArray() {
    return this._code.map(content => {
      return {content};
    });
  }

  _createConfig() {
    const {delay, config} = this._options;
    const extraConfig = {
      reporters: this._reporter,
      files: this._files,
      callTestFn: delay === undefined ? syncCall : params => asyncCall(delay, params),
    };
    return Object.assign({}, BASE_CONFIG, extraConfig, config);
  }

  _setOutput(result) {
    this._setOutputByType(result);
    return this._processOutput();
  }

  _setOutputByType(result) { // eslint-disable-line complexity
    switch (this._options.output) {
      case 'result':
        this._output = result;
        break;
      case 'treeReport':
        this._output = this._reporter.getTreeLog();
        break;
      case 'rawReport':
        this._output = this._reporter.getRawLog();
        break;
      case 'flatReport':
      default:
        this._output = this._reporter.getFlatLog();
        break;
    }
  }

  _processOutput() {
    if (this._options.keys) {
      const keys = Array.isArray(this._options.keys) ? this._options.keys : Object.keys(this._options.keys);
      this._output = extractByPaths(this._output, keys);
    }

    if (this._options.processOutput) {
      this._output = this._options.processOutput(this._output);
    }

    return this._output;
  }

  _attachOutputToError(error) {
    Object.defineProperty(error, 'output', {
      value: this._output || this._setOutput()
    });
    return Promise.reject(error);
  }
};

function syncCall({fn, session, context, attempt}) {
  return fn(context, session, attempt);
}

function asyncCall(delay, {fn, session, context, attempt}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        syncCall({fn, session, context, attempt});
        resolve();
      } catch(e) {
        reject(e);
      }
    }, delay);
  });
}

function extractByPaths(obj, paths) {
  return paths.reduce((res, key) => {
    const value = objectPath.get(obj, key);
    if (value !== undefined) {
      res[key] = value;
    }
    return res;
  }, {});
}
