/**
 * Read test files into suites structure
 */

const path = require('path');
const glob = require('glob');
const Suite = require('./suite');
const globals = require('./globals');

module.exports = class Reader {
  constructor(context) {
    this._context = context;
  }
  read(pattern) {
    globals.expose(this._context);
    this._files = glob.sync(pattern);
    this._suites = this._files.map(file => {
      const suite = new Suite({
        name: file,
        fn: () => require(path.resolve(file))
      });
      fillSuite(suite);
      return suite;
    });
    globals.cleanup(this._context);
  }
  get files() {
    return this._files;
  }
  get suites() {
    return this._suites;
  }
};

function fillSuite(suite) {
  globals.currentSuite = suite;
  suite.fill();
  suite.suites.forEach(fillSuite);
}
