/**
 * Check config and apply defaults
 */

/**
 *
 * @type {Config}
 */
const defaults = {
  files: '',
  context: global,
  concurrency: 1,
  reporters: 'console',
  tags: [],
  createEnvs: () => ['defaultEnv'],
  createEnvLabel: env => typeof env === 'string' ? env : JSON.stringify(env),
  createSession: env => Object.assign({}, {env}),
  closeSession: session => {},
  createSuiteContext: suite => Object.assign({}, suite.parent && suite.parent.context),
  createTestContext: test => Object.assign({}, test.parent && test.parent.context),
  /**
   *
   * @param {Object} data
   * @param {Object} data.session
   * @param {Function} data.fn
   * @param {Test} [data.test]
   * @param {String} [data.hook]
   *
   * @returns {Function}
   */
  createTestFn: data => {
    return function () {
      return data.fn(data.session);
    };
  }
};

module.exports = function (config) {
  return Object.assign({}, defaults, config);
};
