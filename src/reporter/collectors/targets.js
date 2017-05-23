/**
 * Collects tests counters for each Target
 */

const {result} = require('../../result');
const {RUNNER_START, TEST_END} = require('../../events');

module.exports = class TargetsCollector {
  constructor() {
    this._executionPerTarget = result.executionPerTarget;
    this._flatSuitesPerTarget = result.flatSuitesPerTarget;
  }

  handleEvent(event, data) {
    switch (event) {
      case RUNNER_START:
        this._calcTotal();
        break;
      case TEST_END:
        this._calcEnded(data);
        break;
    }
  }

  _calcTotal() {
    this._flatSuitesPerTarget.forEach((flatSuites, target) => {
      const total = calcTotal(flatSuites);
      this._executionPerTarget.get(target).tests.total = total;
    });
  }

  _calcEnded({target, error}) {
    const tests = this._executionPerTarget.get(target).tests;
    tests.ended++;
    if (error) {
      tests.failed++;
    } else {
      tests.success++;
    }
  }
};

function calcTotal(flatSuites) {
  return flatSuites.reduce((res, flatSuite) => {
    return res + flatSuite.tests.length;
  }, 0);
}
