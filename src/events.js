/**
 * Events emitted to reporter
 */

module.exports = {
  /**
   * Triggered after runner is initialized
   */
  RUNNER_INIT: 'RUNNER_INIT',

  /**
   * Triggered after runner has processed files and flatten tests but before executing
   */
  RUNNER_START: 'RUNNER_START',

  /**
   * Triggered after all envs and tests are executed or error occured
   */
  RUNNER_END: 'RUNNER_END',

  /**
   * Triggered before the first session of env is started
   */
  ENV_START: 'ENV_START',

  /**
   * Triggered after all tests of env are executed and all sessions are ended
   */
  ENV_END: 'ENV_END',

  /**
   * Triggered before session start
   */
  SESSION_START: 'SESSION_START',

  /**
   * Triggered after session started
   */
  SESSION_STARTED: 'SESSION_STARTED',

  /**
   * Triggered before session end
   */
  SESSION_ENDING: 'SESSION_ENDING',

  /**
   * Triggered after session end
   */
  SESSION_END: 'SESSION_END',

  /**
   * Triggered before suite is executed on particular session
   */
  SESSION_SUITE_START: 'SESSION_SUITE_START',

  /**
   * Triggered after suite is executed on particular session
   */
  SESSION_SUITE_END: 'SESSION_SUITE_END',

  /**
   * Triggered before the first test of suite is executed
   */
  SUITE_START: 'SUITE_START',

  /**
   * Triggered after the last test of suite is executed
   */
  SUITE_END: 'SUITE_END',

  /**
   * Triggered after suite's queue is splitted onto 2 concurrent queues
   */
  SUITE_SPLIT: 'SUITE_SPLIT',

  /**
   * Triggered before hook execution
   */
  HOOK_START: 'HOOK_START',

  /**
   * Triggered after hook execution
   */
  HOOK_END: 'HOOK_END',

  /**
   * Triggered before test fn execution
   */
  TEST_START: 'TEST_START',

  /**
   * Triggered after test fn execution
   */
  TEST_END: 'TEST_END',
};
