/**
 * Sheeva
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const Queue = require('./queue');
const api = require('./api');
const events = require('./events');
const Reporting = require('./reporting');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} config
   * @param {String} config.files
   * @param {Array<String|Object>} [config.reporters='console']
   */
  constructor(config) {
    this._config = config;
    this._fileSuites = [];
  }
  run() {
    this._envs = this._config.createEnvs ? this._config.createEnvs() : ['defaultEnv'];
    this._readFiles();
    this._reporting = new Reporting(this._config.reporters);
    this._emitStart();
    const queues = this._fileSuites.map(suite => new Queue(suite));
    queues.forEach(queue => {
      queue.onEvent = (event, data) => this._reporting.onSessionEvent(event, data);
      queue.run()
    });
    this._emitEnd();
  }
  getReporter(index) {
    return this._reporting.getReporter(index);
  }
  _readFiles() {
    this._context = this._config.context || global;
    api.expose(this._context);
    this._files = glob.sync(this._config.files);
    // console.log('Run files:', this._files, this._config.files)
    this._files.forEach(file => {
      const suite = new Suite({
        name: file,
        fn: () => require(path.resolve(file))
      });
      fillSuite(suite);
      this._fileSuites.push(suite);
    });
    api.cleanup(this._context);
  }
  _emitStart() {
    const data = {
      envs: this._envs,
      files: this._files
    };
    this._reporting.onEvent(events.START, data);
  }
  _emitEnd() {
    this._reporting.onEvent(events.END);
  }
};

function fillSuite(suite) {
  api.currentSuite = suite;
  suite.fill();
  suite.suites.forEach(fillSuite);
}
