/**
 * Events emitted to reporter
 */

module.exports = {
  /**
   * Triggered when runner is initializing
   */
  RUNNER_INIT: 'RUNNER_INIT',
  /**
   * Triggered when runner is started and ready to execute tests
   * - config processed
   * - tests are read, filtered and flattened
   */
  RUNNER_START: 'RUNNER_START',
  /**
   * Triggered when runner has ended
   */
  RUNNER_END: 'RUNNER_END',
  /**
   * Triggered when first session of env is starting
   */
  ENV_START: 'ENV_START',
  /**
   * Triggered when all tests of env are executed and all sessions are ended
   */
  ENV_END: 'ENV_END',
  SESSION_START: 'SESSION_START',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_ENDING: 'SESSION_ENDING',
  SESSION_END: 'SESSION_END',
  SESSION_SUITE_START: 'SESSION_SUITE_START',
  SESSION_SUITE_END: 'SESSION_SUITE_END',
  SUITE_START: 'SUITE_START',
  SUITE_END: 'SUITE_END',
  SUITE_SPLIT: 'SUITE_SPLIT',
  HOOK_START: 'HOOK_START',
  HOOK_END: 'HOOK_END',
  TEST_START: 'TEST_START',
  TEST_END: 'TEST_END',
};
