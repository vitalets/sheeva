'use strict';

/**
 * Events emitted to reporter
 */

module.exports = {
  /**
   * Triggered before reading tests
   */
  RUNNER_START: 'RUNNER_START',

  /**
   * Triggered when tests are read and transformed, but before execution
   */
  RUNNER_STARTED: 'RUNNER_STARTED',

  /**
   * Triggered after all targets and tests are executed or error occurred
   */
  RUNNER_END: 'RUNNER_END',

  /**
   * Triggered when tests are read and transformed, but before execution
   */
  EXECUTER_START: 'EXECUTER_START',

  /**
   * Triggered when execution is ended
   */
  EXECUTER_END: 'EXECUTER_END',

  /**
   * Triggered before the first session of target is started
   */
  TARGET_START: 'TARGET_START',

  /**
   * Triggered after all tests of target are executed and all sessions are ended
   */
  TARGET_END: 'TARGET_END',

  /**
   * Triggered when new worker is coming into game
   */
  WORKER_ADD: 'WORKER_ADD',

  /**
   * Triggered when worker leaves the game
   */
  WORKER_DELETE: 'WORKER_DELETE',

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

  /**
   * Triggered for errors thrown while processing another error.
   */
  EXTRA_ERROR: 'EXTRA_ERROR',
};
