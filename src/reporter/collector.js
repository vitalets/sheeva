/**
 * Collects runtime data about running env suites
 */

const events = require('../events');

module.exports = class Collector {
  constructor(reporter, envSuites) {
    this._reporter = reporter;
    this._envStatus = new Map();
    envSuites.forEach((suites, env) => {
      this._envStatus.set(env, {
        planned: suites,
        finished: [],
        running: new Map(),
        ended: false,
      });
    });
  }
  handleSessionSuiteStart(data) {
    const suite = data.suite;
    const env = suite.env;
    const envStatus = this._envStatus.get(env);
    let counter = envStatus.running.get(suite) || 0;
    counter++;
    envStatus.running.set(suite, counter);
    if (counter === 1) {
      this._reporter.onEvent(events.SUITE_START, data);
    }
  }
  handleSessionSuiteEnd(data) {
    const suite = data.suite;
    const env = suite.env;
    const envStatus = this._envStatus.get(env);
    let counter = envStatus.running.get(suite);
    counter--;
    if (counter) {
      envStatus.running.set(suite, counter);
    } else {
      envStatus.running.delete(suite);
      this._reporter.onEvent(events.SUITE_END, data);
    }
  }
  // _handleFinalSuiteEnd(suite, data) {
  //   const env = suite.env;
  //   const envStatus = this._envStatus.get(env);
  //   if (envStatus.planned.indexOf(suite) >= 0) {
  //     envStatus.finished.push(suite);
  //     if (envStatus.finished.length === envStatus.planned.length) {
  //       envStatus.ended = true;
  //       this._reporter.onEvent(events.ENV_END, cleanSessionInfo(data));
  //     }
  //   }
  // }
};


