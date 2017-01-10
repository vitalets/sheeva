/**
 * Global API for tests
 */

const appender = require('./appender');
const meta = require('./meta');

/**
 * Exposes methods to the context
 *
 * @param {Object} context
 */
exports.expose = function (context) {
  Object.keys(methods).forEach(method => context[method] = methods[method]);
};

/**
 * Cleanups methods from the context
 *
 * @param {Object} context
 */
exports.cleanup = function (context) {
  Object.keys(methods).forEach(method => delete context[method]);
};

// suite

const methods = {};

methods.describe = function (name, fn) {
  appender.addSuite(name, fn);
};

methods.ddescribe = methods.describe.only = function (name, fn) {
  methods.$only();
  methods.describe(name, fn);
};

methods.xdescribe = methods.describe.skip = function (name, fn) {
  methods.$skip();
  methods.describe(name, fn);
};

// test

methods.it = function (name, fn) {
  appender.addTest(name, fn);
};

methods.iit = methods.it.only = function (name, fn) {
  methods.$only();
  methods.it(name, fn);
};

methods.xit = methods.it.skip = function (name, fn) {
  methods.$skip();
  methods.it(name, fn);
};

// hooks

methods.before = methods.beforeAll = function (fn) {
  appender.addHook('before', fn);
};

methods.beforeEach = function (fn) {
  appender.addHook('beforeEach', fn);
};

methods.after = methods.afterAll = function (fn) {
  appender.addHook('after', fn);
};

methods.afterEach = function (fn) {
  appender.addHook('afterEach', fn);
};

// meta

methods.$tags = function () {
  meta.tags.apply(meta, arguments);
};

methods.$skip = function (fn) {
  meta.skip(fn);
};

methods.$only = function () {
  meta.only();
};

methods.$if = function (fn) {
  meta.if(fn);
};

methods.$serial =function () {
  meta.serial();
};
