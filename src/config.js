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
   * Max count of concurent sessions
   */
  concurrency: 1,
  /**
   * Allows suite splitting for parallelization
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
   *
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

  clearSessionData: function (data, session) {
  },
  /**
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
  createWrapFn: function (params) {
    const {fn, session} = params;
    return function () {
      return fn(session.data);
    };
  }
};

module.exports = function (config) {
  const result = Object.assign({}, defaults, config);
  result.reporters = Array.isArray(result.reporters) ? result.reporters : [result.reporters];
  return result;
};
