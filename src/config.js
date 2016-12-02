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
      {id: 'defaultEnv'}
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
   * Creates data attached to every session in env.
   * For Webdriver tests it is usually `driver` instance.
   *
   * @param {Object} env
   */
  createSessionData: function (env) {
    return {};
  },

  /**
   * Removes previously created session data
   *
   * @param {*} data
   * @param {Session} session
   */
  removeSessionData: function (data, session) {
  },
  /**
   * Function that actually calls each test and hook.
   * This convenient way to setup arguments passed inside your tests.
   * By default session.data is passed as parameter.
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
    return params.fn(params.session.data, params.context);
  }
};

module.exports = function (config) {
  const result = Object.assign({}, defaults, config);
  result.reporters = Array.isArray(result.reporters) ? result.reporters : [result.reporters];
  return result;
};
