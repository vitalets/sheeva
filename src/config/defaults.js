/**
 * Default config values
 */

'use strict';

/* eslint-disable no-unused-vars */

/**
 * @type {Config}
 */
module.exports = {
  /**
   * Test files pattern or array of patterns, e.g. './test/*.js'
   */
  files: [],

  /**
   * Max number of parallel workers
   */
  concurrency: 1,

  /**
   * todo:
   * How targets are executed per pool of sessions:
   * - `fullTargetFirst`: run all available sessions of first target, then run on second target, etc
   * - `fullTargetFirstDone`: run all available sessions of first target and wait until it's done, then run on second
   * - `allTargets`: run all targets in parallel (not supported yet)
   */
  //concurrencyMode: 'fullTargetFirst',

  /**
   * Start new session for each file.
   * Even if file will be splitted, new session will be started for splitted part.
   */
  newSessionPerFile: false,

  /**
   * Allows to split suites between parallel sessions
   */
  splitSuites: false,

  /**
   * Break runner on first error
   */
  breakOnError: false,

  /**
   * Reporters
   */
  reporters: [],

  /**
   * Tags to run
   */
  tags: [],

  /**
   * Disallow ONLY tests. Useful for pre-commit / pre-push hooks.
   */
  noOnly: false,

  /**
   * Default test/hook timeout in ms
   */
  timeout: 10000,

  /**
   * Run target with particular id
   */
  target: '',

  /**
   * Creates targets.
   * Each target should have `id` property and can overwrite some config fields.
   *
   * @returns {Array<Object>}
   */
  createTargets: function () {
    return [
      {
        /**
         * Each target must have unique id
         * @type {String}
         */
        id: 'default-target',
        /**
         * Target own concurrency limit
         * @type {Number}
         */
        concurrency: 0,
      }
    ];
  },

  /**
   * Creates one-line target label to be shown in reports
   *
   * @param {Object} target
   * @returns {String}
   */
  createTargetLabel: function (target) {
    return target.id;
  },

  /**
   * Called after tests are read and transformed, but before execution
   *
   * @param {Config} config
   * @returns {Promise}
   */
  startRunner: function (config) { },

  /**
   * Called when all tests are executed
   *
   * @param {Config} config
   * @returns {Promise}
   */
  endRunner: function (config) { },

  /**
   * Called when virtual worker is starting.
   * Can start any real worker, e.g. WebWorker or Node.js instance.
   *
   * @param {Worker} worker
   * @returns {Promise}
   */
  startWorker: function (worker) { },

  /**
   * Called when virtual worker is ending.
   * Can stop any real worker, e.g. WebWorker or Node.js instance.
   *
   * @param {Worker} worker
   * @returns {Promise}
   */
  endWorker: function (worker) { },

  /**
   * Attach any data to session.
   *
   * @param {Session} session
   * @returns {Promise}
   */
  startSession: function (session) { },

  /**
   * Cleanup session data.
   *
   * @param {Session} session
   * @returns {Promise}
   */
  endSession: function (session) { },

  /**
   * Function that is called for each hook.
   * Allows to define which arguments are passed to the hook fn.
   *
   * @param {Object} params
   * @param {Object} params.session
   * @param {Function} params.fn
   * @param {Object} params.context
   * @param {Object} params.target
   * @param {Suite} params.suite
   * @param {Hook} params.hook
   *
   * @returns {Function}
   */
  callHookFn: function (params) {
    const {fn, context, session} = params;
    return fn(context, session);
  },

  /**
   * Function that is called for each test.
   * Allows to define which arguments are passed to the test fn.
   *
   * @param {Object} params
   * @param {Object} params.session
   * @param {Function} params.fn
   * @param {Object} params.context
   * @param {Object} params.target
   * @param {Suite} params.suite
   * @param {Number} params.attempt
   * @param {Test} params.test
   *
   * @returns {Function}
   */
  callTestFn: function (params) {
    const {fn, context, session, attempt} = params;
    return fn(context, session, attempt);
  },
};
