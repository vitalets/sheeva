/**
 * Read test files into suites tree structure
 */

const path = require('path');
const glob = require('glob');
const {config} = require('../config');
const {result} = require('../result');
const PropsInjector = require('../utils/props-injector');
const AnnotationsReader = require('./annotations');
const TestsReader = require('./tests');

module.exports = class Reader {
  /**
   * Constructor
   */
  constructor() {
    this._context = global;
    this._files = result.processedFiles;
    this._annotationsReader = new AnnotationsReader();
    this._testsReader = new TestsReader(this._annotationsReader);
    this._propsInjector = new PropsInjector();
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
  }

  _expandPatterns() {
    config.files.forEach(pattern => {
      const files = expandPattern(pattern);
      files.forEach(file => this._files.add(file));
    });
  }

  _createTopSuites() {
    this._files.forEach(file => {
      const fn = () => readFile(file);
      config.targets.forEach(target => this._testsReader.addTopSuite(target, file, fn));
    });
  }

  _injectApi() {
    const methods = Object.assign(
      {},
      this._annotationsReader.api,
      this._testsReader.api
    );
    this._propsInjector.inject(this._context, methods);
  }

  _readFiles() {
    this._testsReader.fill();
  }

  _cleanupApi() {
    this._propsInjector.cleanup();
  }
};

// todo: move to separate module for browser
function readFile(file) {
  require(path.resolve(file));
}

// todo: move to separate module for browser
function expandPattern(pattern) {
  const isPattern = pattern.indexOf('*') >= 0;
  const isFile = /\.[a-z]{1,3}$/i.test(pattern);
  if (!isPattern && !isFile) {
    pattern = path.join(pattern, '**');
  }
  return glob.sync(pattern, {nodir: true});
}


