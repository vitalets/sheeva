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
   * Triggered after all envs and tests are executed or error occurred
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
   * Triggered when new slot is coming into game
   */
  SLOT_ADD: 'SLOT_ADD',

  /**
   * Triggered when slot leaves the game
   */
  SLOT_DELETE: 'SLOT_DELETE',

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
   * Triggered when suite is started.
   * Note that there can be many SUITE_START events due to parallel execution.
   */
  SUITE_START: 'SUITE_START',

  /**
   * Triggered when suite is ended.
   * Note that there can be many SUITE_END events due to parallel execution.
   */
  SUITE_END: 'SUITE_END',

  /**
   * Triggered when queue is splitted onto 2 concurrent queues
   */
  QUEUE_SPLIT: 'QUEUE_SPLIT',

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

  /**
   * Triggered instead of TEST_END when test is going to be retried
   */
  TEST_RETRY: 'TEST_RETRY',
};
