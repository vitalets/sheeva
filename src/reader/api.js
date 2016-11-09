/**
 * Global API for tests
 *
 */

const builder = require('./builder');
const meta = require('./meta');

// suite

exports.describe = function (name, fn) {
  builder.addSuite(name, fn);
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
  builder.addTest(name, fn);
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

exports.before = function (fn) {
  builder.addHook('before', fn);
};

exports.beforeEach = function (fn) {
  builder.addHook('beforeEach', fn);
};

exports.after = function (fn) {
  builder.addHook('after', fn);
};

exports.afterEach = function (fn) {
  builder.addHook('afterEach', fn);
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
