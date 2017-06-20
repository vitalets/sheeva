/**
 * Runner state singleton.
 */

'use strict';

const {config} = require('../configurator');
const ExtraMap = require('../utils/extra-map');
const ExtraSet = require('../utils/extra-set');

class State {
  init() {
    this._clear();
    this.config = config;
    this.errors = new ExtraMap();
    this._initRunner();
    this._initReader();
    this._initTransformer();
    this._initExecuter();
  }

  /**
   * Returns serializable result
   */
  getResult() {

  }

  // todo: maybe move to result class
  _initRunner() {
    this.runner = {
      times: {
        init: 0,
        start: 0,
        end: 0,
      },
      tests: {
        total: 0,
        ended: 0,
        success: 0,
        failed: 0,
      }
    };
  }

  _initReader() {
    this.topSuitesPerTarget = new ExtraMap();
    this.annotationsPerTarget = new ExtraMap();
    this.matchedFiles = new ExtraSet();
    config.targets.forEach(target => {
      this.annotationsPerTarget.set(target, {
        only: new ExtraSet(),
        skip: new ExtraSet(),
        tags: new ExtraMap(),
      });
    });
  }

  _initTransformer() {
    this.flatSuitesPerTarget = new ExtraMap();
    this.only = {
      files: new ExtraSet()
    };
    this.skip = {
      files: new ExtraSet(),
      suites: new ExtraSet(),
      tests: new ExtraSet(),
    };
    this.tags = {
      intersected: new ExtraSet()
    };
  }

  _initExecuter() {
    this.filteredFlatSuitesPerTarget = new ExtraMap();
    this.sessions = new ExtraMap();
    this.executionPerTarget = new ExtraMap();
    this.workers = new ExtraSet();
    config.targets.forEach((target, index) => {
      this.executionPerTarget.set(target, {
        index,
        started: false,
        ended: false,
        tests: {
          total: 0,
          ended: 0,
          success: 0,
          failed: 0,
        },
      });
    });
  }

  _clear() {
    Object.keys(this).forEach(key => delete this[key]);
  }
}

module.exports = new State();
