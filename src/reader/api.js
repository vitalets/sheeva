/**
 * Global API for tests
 */

const meta = require('./meta');
const Appender = require('./appender');

const methods = {};
let currentAppender = null;

/**
 * Injects methods to the context
 *
 * @param {Object} context
 */
exports.inject = function (context) {
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

/**
 * Recursively fills suites with children by calling fn
 *
 * @param {Map<Function,Array<Suite>>} fnSuites
 */
exports.fillSuites = function fillSuites(fnSuites) {
  fnSuites.forEach((suites, fn) => {
    currentAppender = new Appender(suites);
    fn();
    fillSuites(currentAppender.childFnSuites);
  });
};

// suite

methods.describe = function (name, fn) {
  currentAppender.addChildSuite(name, fn);
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
  currentAppender.addChildTest(name, fn);
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
  currentAppender.addHook('before', fn);
};

methods.beforeEach = function (fn) {
  currentAppender.addHook('beforeEach', fn);
};

methods.after = methods.afterAll = function (fn) {
  currentAppender.addHook('after', fn);
};

methods.afterEach = function (fn) {
  currentAppender.addHook('afterEach', fn);
};

// meta

methods.$only = function () {
  meta.only();
};

methods.$skip = function () {
  meta.skip();
};

methods.$tags = function () {
  meta.tags.apply(meta, arguments);
};

methods.$if = function (fn) {
  meta.if(fn);
};

methods.$ignore = function (fn) {
  meta.ignore(fn);
};

methods.$serial =function () {
  meta.serial();
};
