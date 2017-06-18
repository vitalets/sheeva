/**
 * Collects runner times
 */

'use strict';

/* eslint-disable complexity, max-statements */

const state = require('../../state');
const {
  RUNNER_START,
  RUNNER_STARTED,
  RUNNER_END,
  TEST_END,
} = require('../../events');

module.exports = class RunnerCollector {
  constructor() {
    this._runner = state.runner;
    this._executionPerTarget = state.executionPerTarget;
  }

  handleEvent(event, data) {
    switch (event) {
      case RUNNER_START: {
        this._runner.times.start = data.timestamp;
        break;
      }
      case RUNNER_STARTED: {
        this._runner.times.started = data.timestamp;
        this._calcTestsTotal();
        break;
      }
      case RUNNER_END: {
        this._runner.times.end = data.timestamp;
        break;
      }
      case TEST_END: {
        this._processTestEnd(data);
        break;
      }
    }
  }

  _calcTestsTotal() {
    this._executionPerTarget.forEach(execution => this._runner.tests.total += execution.tests.total);
  }

  _processTestEnd(data) {
    this._runner.tests.ended++;
    if (data.error) {
      this._runner.tests.failed++;
    } else {
      this._runner.tests.success++;
    }
  }
};
