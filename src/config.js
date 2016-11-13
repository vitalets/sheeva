/**
 * Check config and apply defaults
 */

/**
 * @type {Config}
 */
const defaults = {
  files: '',
  context: global,
  concurrency: 1,
  reporters: 'console',
  tags: [],
  splitSuites: false,
  createEnvs: function () {
    return [
      'defaultEnv'
    ];
  },
  createEnvLabel: function (env) {
    return typeof env === 'string' ? env : JSON.stringify(env);
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
  return Object.assign({}, defaults, config);
};
