/**
 * Global API for tests
 *
 */

const Suite = require('./suite');
const Test = require('./test');

let currentSuite = null;
let options = {};

exports.describe = function (name, fn) {
  const suite = new Suite(Object.assign({name, fn}, options));
  currentSuite.addSuite(suite);
  options = {};
};

exports.ddescribe = exports.describe.only = function (name, fn) {
  exports.$only();
  exports.describe(name, fn);
};

exports.xdescribe = exports.describe.skip = function (name, fn) {
  exports.$skip();
  exports.describe(name, fn);
};

exports.it = function (name, fn) {
  const test = new Test(Object.assign({name, fn}, options));
  currentSuite.addTest(test);
  options = {};
};

exports.iit = exports.it.only = function (name, fn) {
  exports.$only();
  exports.it(name, fn);
};

exports.xit = exports.it.skip = function (name, fn) {
  exports.$skip();
  exports.it(name, fn);
};

exports.before = function (fn) {
  currentSuite.addHook('before', fn);
};

exports.beforeEach = function (fn) {
  currentSuite.addHook('beforeEach', fn);
};

exports.after = function (fn) {
  currentSuite.addHook('after', fn);
};

exports.afterEach = function (fn) {
  currentSuite.addHook('afterEach', fn);
};

// meta

exports.$tags = function () {

};

exports.$skip = function (fn) {
  options.skip = fn ? fn() : true;
};

exports.$only = function () {
  options.only = true;
};

exports.$if = function (fn) {
  options.skip = !fn();
};

exports.$serial = function () {
  options.serial = true;
};

Object.defineProperty(exports, 'currentSuite', {
  get: () => currentSuite,
  set: suite => currentSuite = suite,
  enumerable: false,
  configurable: false
});
