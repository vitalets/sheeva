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
  splitSuites: false,
  createTargets: function () {
    return [{id: 'target1'}];
  },
};

module.exports = class SubSheeva {
  /**
   * Constructor
   *
   * @param {String|Array} code
   * @param {Object} options
   * @param {Number} options.sessionIndex
   * @param {String} options.targetId
   * @param {Number} [options.delay]
   * @param {Object} [options.config]
   * @param {Array} [options.include]
   * @param {Array} [options.exclude]
   * @param {Boolean} [options.flat]
   * @param {Boolean} [options.rawEvents]
   * @param {Boolean} [options.result]
   * @param {Function} [options.processOutput]
   * @returns {Promise}
   */
  constructor(code, options) {
    this._files = this._createFilesArray(code, options);
    this._options = options;
    this._reporter = new Reporter(options);
    this._config = this._createConfig(options.config);
    this._sheeva = null;
    this._output = null;
  }

  run() {
    const Sheeva = getSheeva();
    this._sheeva = new Sheeva(this._config);
    return this._sheeva.run()
      .then(result => this._output = this._getOutput(result))
      .catch(e => this._attachOutputToError(e));
  }

  _createFilesArray(code, {targetId, sessionIndex}) {
    code = Array.isArray(code) ? code : [code];
    return code.map((item, index) => {
      return {
        name: `temp-${targetId}-${sessionIndex}-${index}.js`,
        content: item,
      };
    });
  }

  _createConfig(config) {
    const {delay} = this._options;
    const extraConfig = {
      reporters: this._reporter,
      files: this._files,
      callTestHookFn: delay === undefined ? syncCall : params => asyncCall(delay, params)
    };
    return Object.assign({}, BASE_CONFIG, extraConfig, config);
  }

  _getOutput(result) {
    return this._options.result
      ? this._processOutput(result, this._options.result)
      : this._processOutput(this._reporter.getReport(), this._options.rawEvents);
  }

  _attachOutputToError(error) {
    return this._options.result
      ? attachToError(error, 'result', this._output || this._getOutput())
      : attachToError(error, 'report', this._output || this._getOutput());
  }

  _processOutput(output, paths) {
    output = Array.isArray(paths) ? extractByPaths(output, paths) : output;
    return this._options.processOutput ? this._options.processOutput(output) : output;
  }
};

function attachToError(error, key, value) {
  Object.defineProperty(error, key, {value});
  return Promise.reject(error);
}

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
