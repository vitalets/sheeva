/**
 * Check config and apply defaults
 */

/**
 * @type {Config}
 */
const defaults = {
  /**
   * Test files pattern or array of patterns
   */
  files: '',

  /**
   * Max number of concurrent sessions
   */
  concurrency: 1,

  /**
   * How envs are executed per pool of sessions:
   * - `fullEnvFirst`: run all available sessions of first env, then run on second env, etc
   * - `fullEnvFirstDone`: run all available sessions of first env and wait until it's done, then run on second env, etc
   * - `allEnvsParallel`: run all envs in parallel (not supported yet)
   */
  concurrencyMode: 'fullEnvFirst',

  /**
   * Allows suite splitting between parallel sessions
   */
  splitSuites: true,

  /**
   * todo:
   * Action when test/hook fails:
   * - stop
   * - continue-env (default)
   * - continue-all
   */
  onError: 'continue-env',

  /**
   * Reporters
   */
  reporters: [],

  /**
   * Tags to run
   */
  tags: [],

  /**
   * todo:
   */
  useTimings: true,

  /**
   * Creates envs (environments).
   * Each env should have `id` property.
   *
   * @returns {Array<Object>}
   */
  createEnvs: function () {
    return [
      {id: 'default-env'}
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
   * @param {Object} env
   * @param {Session} session
   * @returns {Promise}
   */
  startSession: function (env, session) { },

  /**
   * Cleanup session data.
   * For Webdriver tests it is usually a `session.driver.quit()`
   *
   * @param {Session} session
   * @returns {Promise}
   */
  endSession: function (session) { },

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
   * @param {Test} [params.test]
   * @param {Test} [params.suite]
   * @param {String} [params.hookType]
   *
   * @returns {Function}
   */
  callTestHookFn: function (params) {
    return params.fn(params.session, params.context);
  },

  /**
   * Start runner hook
   * For Webdriver tests it may be starting local selenium server
   *
   * @param {Config} config
   * @returns {Promise}
   */
  startRunner: function (config) { },

  /**
   * End runner hook
   * For Webdriver tests it may be stopping local selenium server
   *
   * @param {Config} config
   * @returns {Promise}
   */
  endRunner: function (config) { },
};

module.exports = function (config) {
  const result = Object.assign({}, defaults, config);
  result.reporters = Array.isArray(result.reporters) ? result.reporters : [result.reporters];
  return result;
};
