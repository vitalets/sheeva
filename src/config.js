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
   * Allows suite split for parallelization
   */
  suiteSplit: true,
  /**
   * Reporters
   */
  reporters: [],
  /**
   * Tags to run
   */
  tags: [],
  /**
   * Whether to split suites for parallelization
   */
  splitSuites: false,
  /**
   *
   */
  useTimings: true,
  /**
   * Returns environments
   * @returns {Array}
   */
  createEnvs: function () {
    return [
      {id: 'defaultEnv'}
    ];
  },
  createEnvLabel: function (env) {
    return env.id;
  },
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
