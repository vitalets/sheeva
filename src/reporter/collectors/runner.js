/**
 * Collects runner times
 */

/* eslint-disable complexity, max-statements */

const {result} = require('../../result');
const {
  RUNNER_INIT,
  RUNNER_START,
  RUNNER_END,
  TEST_END,
} = require('../../events');

module.exports = class RunnerCollector {
  constructor() {
    this._runner = result.runner;
    this._executionPerTarget = result.executionPerTarget;
  }

  handleEvent(event, data) {
    switch (event) {
      case RUNNER_INIT: {
        this._runner.times.init = data.timestamp;
        break;
      }
      case RUNNER_START: {
        this._runner.times.start = data.timestamp;
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
