/**
 * Collects runtime data about env
 */

const events = require('../events');

module.exports = class EnvCollector {
  constructor(reporter, envs) {
    this._reporter = reporter;
    this._envFiles = new Map();
    envs.forEach(env => {
      this._envFiles.set(env, {
        total: 0,
        running: 0,
        ended: 0,
        success: 0,
        errors: 0,
      });
    });
  }
  handleEnvStart(data) {

  }
  handleFileSuiteStart({suite}) {
    const stat = this._envFiles.get(suite.env);
    stat.running++;
  }
  handleFileSuiteEnd({suite, error}) {
    const stat = this._envFiles.get(suite.env);
    stat.running--;
    stat.ended++;
    if (error) {
      stat.errors++;
    } else {
      stat.success++;
    }
  }
  handleSessionStart(data) {

  }
  handleSessionEnd(data) {

  }
};


