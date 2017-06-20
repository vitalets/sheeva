'use strict';

/**
 * Sheeva entry point
 */

require('promise.prototype.finally.err').shim();

const utils = require('./utils');
const configurator = require('./configurator');
const reporter = require('./reporter');
const state = require('./state');
const Reader = require('./reader');
const transform = require('./transformer');
const Executer = require('./executer');
const {RUNNER_START, RUNNER_STARTED, RUNNER_END} = require('./events');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} rawConfig
   */
  constructor(rawConfig) {
    this._rawConfig = rawConfig;
  }

  /**
   * Run tests execution
   *
   * @returns {Promise}
   */
  run() {
    return Promise.resolve()
      .then(() => this.prepare())
      .then(() => this.execute())
      .finally(e => this.end(e))
      // todo: return Result instead of state
      //.then(() => state.getResult());
      .then(() => state);
  }

  /**
   * Prepare:
   * - configure
   * - read tests
   * - transform tests
   *
   * @returns {Promise}
   */
  prepare() {
    return Promise.resolve()
      .then(() => this._init())
      .then(() => new Reader().read())
      .then(() => transform())
      .then(() => this._startRunner());
  }

  /**
   * Executes tests by flat suites
   *
   * @param {Locator} [locator]
   * @returns {Promise}
   */
  execute(locator) {
    return new Executer().run(locator);
  }

  /**
   * Ends runner
   *
   * @param {Error} [error]
   * @returns {Promise}
   */
  end(error) {
    const {config} = configurator;
    return Promise.resolve()
      .then(() => config.endRunner(config))
      .catch(e => error ? reporter.handleError(e) : Promise.reject(e))
      .finally(e => reporter.handleEvent(RUNNER_END, {error: error || e}))
      .finally(() => reporter.stopListen())
      .catch(e => Promise.reject(error || e));
  }

  _init() {
    configurator.init(this._rawConfig);
    state.init();
    reporter.init();
    reporter.handleEvent(RUNNER_START);
  }

  _startRunner() {
    const {config} = configurator;
    return utils.thenCall(() => config.startRunner(config))
      .then(() => reporter.handleEvent(RUNNER_STARTED));
  }
};
