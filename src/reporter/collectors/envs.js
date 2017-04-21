/**
 * Collects tests counters for each Env
 */

const {result} = require('../../result');
const {RUNNER_START, TEST_END} = require('../../events');

module.exports = class EnvsCollector {
  constructor() {
    this._executionPerEnv = result.executionPerEnv;
    this._flatSuitesPerEnv = result.flatSuitesPerEnv;
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
    this._flatSuitesPerEnv.forEach((flatSuites, env) => {
      const total = calcTotal(flatSuites);
      this._executionPerEnv.get(env).tests.total = total;
    });
  }

  _calcEnded({env, error}) {
    const tests = this._executionPerEnv.get(env).tests;
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
