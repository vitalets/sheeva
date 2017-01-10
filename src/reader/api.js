/**
 * Global API for tests
 */

const appender = require('./appender');
const meta = require('./meta');

// suite

exports.describe = function (name, fn) {
  appender.addSuite(name, fn);
};

exports.ddescribe = exports.describe.only = function (name, fn) {
  exports.$only();
  exports.describe(name, fn);
};

exports.xdescribe = exports.describe.skip = function (name, fn) {
  exports.$skip();
  exports.describe(name, fn);
};

// test

exports.it = function (name, fn) {
  appender.addTest(name, fn);
};

exports.iit = exports.it.only = function (name, fn) {
  exports.$only();
  exports.it(name, fn);
};

exports.xit = exports.it.skip = function (name, fn) {
  exports.$skip();
  exports.it(name, fn);
};

// hooks

exports.before = exports.beforeAll = function (fn) {
  appender.addHook('before', fn);
};

exports.beforeEach = function (fn) {
  appender.addHook('beforeEach', fn);
};

exports.after = exports.afterAll = function (fn) {
  appender.addHook('after', fn);
};

exports.afterEach = function (fn) {
  appender.addHook('afterEach', fn);
};

// meta

exports.$tags = function () {
  meta.tags.apply(meta, arguments);
};

exports.$skip = function (fn) {
  meta.skip(fn);
};

exports.$only = function () {
  meta.only();
};

exports.$if = function (fn) {
  meta.if(fn);
};

exports.$serial =function () {
  meta.serial();
};
