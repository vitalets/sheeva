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
    exposeGlobals(this._context);
    this._files = glob.sync(pattern);
    this._suites = [];
    for (let i = 0; i < this._files.length; i++) {
      const file = this._files[i];
      const suite = new Suite({
        name: file,
        fn: () => require(path.resolve(file))
      });
      fillSuite(suite);
      this._suites.push(suite);
    }
    cleanupGlobals(this._context);
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

function exposeGlobals(context) {
  Object.keys(globals).forEach(key => context[key] = globals[key]);
}

function cleanupGlobals(context) {
  Object.keys(globals).forEach(key => delete context[key]);
}
