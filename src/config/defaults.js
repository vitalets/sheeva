/**
 * Default config values
 */

/**
 * @type {Config}
 */
module.exports = {
  /**
   * Test files pattern or array of patterns, e.g. './test/*.js'
   */
  files: [],

  /**
   * Max number of concurrent sessions
   */
  concurrency: 1,

  /**
   * todo:
   * How envs are executed per pool of sessions:
   * - `fullEnvFirst`: run all available sessions of first env, then run on second env, etc
   * - `fullEnvFirstDone`: run all available sessions of first env and wait until it's done, then run on second env, etc
   * - `allEnvs`: run all envs in parallel (not supported yet)
   */
  //concurrencyMode: 'fullEnvFirst',

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
   * todo: store timing information in file
   */
  //useTimings: true,

  /**
   * Disallow ONLY tests. Useful for pre-commit / pre-push hooks.
   * @type {Boolean}
   */
  noOnly: false,

  /**
   * Default test/hook timeout in ms
   *
   * @type {Number}
   */
  timeout: 10000,

  /**
   * Run env with particular id
   * @type {String}
   */
  env: '',

  /**
   * Creates environments (shortly envs).
   * Each env should have `id` property and can overwrite some config fields.
   *
   * @returns {Array<Object>}
   */
  createEnvs: function () {
    return [
      {
        /**
         * Each environment must have unique id
         * @type {String}
         */
        id: 'default-env',
        /**
         * Env own concurrency limit
         * @type {Number}
         */
        concurrency: 0,
      }
    ];
  },

  /**
   * Creates one-line env label to be shown in reports
   *
   * @param {Object} env
   * @returns {String}
   */
  createEnvLabel: function (env) {
    return env.id;
  },

  /**
   * Attach any data to session.
   * For Webdriver tests it is usually a `driver` instance.
   *
   * @param {Session} session
   * @returns {Promise}
   */
  startSession: function (session) { }, // eslint-disable-line no-unused-vars

  /**
   * Cleanup session data.
   * For Webdriver tests it is usually a `session.driver.quit()`
   *
   * @param {Session} session
   * @returns {Promise}
   */
  endSession: function (session) { }, // eslint-disable-line no-unused-vars

  /**
   * Function that actually calls each test and hook.
   * This convenient way to passed needed arguments in your tests.
   * By default session and context are passed.
   * For Webdriver tests it is usually a `session.driver` instance.
   *
   * @param {Object} params
   * @param {Object} params.session
   * @param {Function} params.fn
   * @param {Object} params.context
   * @param {Object} params.env
   * @param {Suite} params.suite
   * @param {Number} params.attempt
   * @param {Test} [params.test]
   * @param {Hook} [params.hook]
   *
   * @returns {Function}
   */
  callTestHookFn: function (params) {
    const {fn, context, session, attempt} = params;
    return fn(context, session, attempt);
  },

  /**
   * Start runner hook, called after tests are read and transformed, but before execution
   * For Webdriver tests it may be starting local selenium server
   *
   * @param {Config} config
   * @returns {Promise}
   */
  startRunner: function (config) { }, // eslint-disable-line no-unused-vars

  /**
   * End runner hook
   * For Webdriver tests it may be stopping local selenium server
   *
   * @param {Config} config
   * @returns {Promise}
   */
  endRunner: function (config) { }, // eslint-disable-line no-unused-vars
};
