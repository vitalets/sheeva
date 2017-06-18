'use strict';

/**
 * Read test files into suites tree structure
 */

const assert = require('assert');
const {config} = require('../configurator');
const state = require('../state');
const PropsInjector = require('../utils/props-injector');
const AnnotationsReader = require('./annotations');
const TestsReader = require('./tests');
const EvalReader = require('./files/eval');
const fsReader = require('./files/fs');

module.exports = class Reader {
  /**
   * Constructor
   */
  constructor() {
    this._context = getGlobal();
    this._matchedFiles = state.matchedFiles;
    this._filesReader = null;
    this._annotationsReader = new AnnotationsReader();
    this._testsReader = new TestsReader(this._annotationsReader);
    this._propsInjector = new PropsInjector();
  }

  /**
   * Reads patterns and creates suite tree
   */
  read() {
    this._createFilesReader();
    this._matchFiles();
    this._createTopSuites();
    return this._filesReader.isAsync
      ? this._fillTopSuitesAsync()
      : this._fillTopSuites();
  }

  _createFilesReader() {
    this._filesReader = typeof config.files[0] === 'string' ? fsReader : new EvalReader();
  }

  _matchFiles() {
    config.files.forEach(file => {
      const fileNames = this._filesReader.matchFile(file);
      fileNames.forEach(fileName => this._matchedFiles.add(fileName));
    });
    assert(this._matchedFiles.size, 'No files matched');
  }

  _createTopSuites() {
    this._matchedFiles.forEach(fileName => {
      const fn = () => this._filesReader.executeFile(fileName);
      config.targets.forEach(target => this._testsReader.addTopSuite(target, fileName, fn));
    });
  }

  _fillTopSuites() {
    this._injectApi();
    this._testsReader.fill();
    this._cleanupApi();
  }

  _fillTopSuitesAsync() {
    this._injectApi();
    return this._testsReader.fillAsync()
      .finally(() => this._cleanupApi());
  }

  _injectApi() {
    const methods = Object.assign(
      {},
      this._annotationsReader.api,
      this._testsReader.api
    );
    this._propsInjector.inject(this._context, methods);
  }

  _cleanupApi() {
    this._propsInjector.cleanup();
  }
};

function getGlobal() {
  if (typeof window !== 'undefined') {
    return window;
  } else if (typeof global !== 'undefined') {
    return global;
  } if (typeof self !== 'undefined') {
    return self;
  } else {
    throw new Error('Unknown global context');
  }
}
