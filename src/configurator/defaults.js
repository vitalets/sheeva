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
   * Start new session for each file
   */
  newSessionPerFile: false,

  /**
   * Allows to split files between parallel sessions
   */
  splitFiles: false,

  /**
   * todo:
   * Action when test/hook fails:
   * - stop
   * - continue-env (default)
   * - continue-all
   *
   * or just bail?
   */
  //onError: 'continue-env',

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
   */
  noOnly: false,

  /**
   * Run env with particular id
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
         * Each environment must have id property
         */
        id: 'default-env',
        /**
         * Priority defines in with order envs will be executed.
         * Envs with equal priority will be executed simultaneously sharing the concurrency limit
         */
        // priority: <number>
        /**
         * Env can have own concurrency limit.
         */
        // concurrency: <number>
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
