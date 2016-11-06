/**
 * Sheeva
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const Queue = require('./queue');
const Collector = require('./collector');
const api = require('./api');

module.exports = class Sheeva {
  /**
   * Constructor
   *
   * @param {Object} config
   * @param {String} config.files
   * @param {String} config.reporter
   */
  constructor(config) {
    this._config = config;
    this._fileSuites = [];
    this.collector = new Collector();
  }
  run() {
    const context = this._config.context || global;
    api.expose(context);
    this.readFiles();
    api.cleanup(context);
    const queues = this._fileSuites.map(suite => new Queue(suite));
    queues.forEach(queue => {
      queue.onEvent = (event, data) => this.collector.update(event, data);
      queue.run()
    });
  }
  readFiles() {
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
  }
};

function fillSuite(suite) {
  api.currentSuite = suite;
  suite.fill();
  suite.suites.forEach(fillSuite);
}

function toStr(suites, level = 0) {
  return `== LEVEL: ${level} ==` + suites.map(s => {
    return `
SUITE: ${s._options.name}
    before(${s._before.length})
    beforeEach(${s._beforeEach.length})
    after(${s._after.length})
    afterEach(${s._afterEach.length})
    it(${s._tests.length})
    suites(${s._suites.length})
    ${s._suites.length ? toStr(s._suites, level + 1) : ''}
`;
  }).join('\n')
}
