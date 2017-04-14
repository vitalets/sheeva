/**
 * Singleton that collects all data while running and pass it reporters.
 */

const {config} = require('../config');
const ExtraMap = require('../utils/extra-map');
const ExtraSet = require('../utils/extra-set');

class Result {
  constructor() {
    this._result = {};
  }

  get result() {
    return this._result;
  }

  init() {
    this._clear();
    this._initCommon();
    this._initReader();
    this._initTransformer();
    this._initExecuter();
  }

  _initCommon() {
    this._result.errors = new ExtraSet();
  }

  _initReader() {
    this._result.topSuitesPerEnv = new ExtraMap();
    this._result.annotationsPerEnv = new ExtraMap();
    this._result.processedFiles = new ExtraSet();
    config.envs.forEach(env => {
      this._result.annotationsPerEnv.set(env, {
        only: new ExtraSet(),
        skip: new ExtraSet(),
        tags: new ExtraMap(),
      });
    });
  }

  _initTransformer() {
    this._result.flatSuitesPerEnv = new ExtraMap();
    this._result.only = {
      files: new ExtraSet()
    };
    this._result.skip = {
      files: new ExtraSet(),
      suites: new ExtraSet(),
      tests: new ExtraSet(),
    };
    this._result.tags = {
      intersected: new ExtraSet()
    };
  }

  _initExecuter() {
    this._result.sessionsPerEnv = new ExtraMap();
    this._result.executionPerEnv = new ExtraMap();
    config.envs.forEach(env => {
      this._result.executionPerEnv.set(env, {
        started: false,
        ended: false,
        testsCount: 0,
      });
    });
  }

  _clear() {
    Object.keys(this._result).forEach(key => {
      delete this._result[key];
    });
  }
}

module.exports = new Result();
