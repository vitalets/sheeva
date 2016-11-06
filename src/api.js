
const Suite = require('./suite');
const Test = require('./test');
const Meta = require('./meta');

let currentSuite = null;
let meta = null;

exports.describe = function (name, fn) {
  const suite = new Suite({meta, name, fn});
  currentSuite.addSuite(suite);
  meta = null;
};

exports.it = function (name, fn) {
  const test = new Test({meta, name, fn});
  currentSuite.addTest(test);
  meta = null;
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

exports.tags = function () {

};

exports.skip = function (fn) {

};

exports.only = function () {

};

exports.runIf = function (fn) {

};

exports.serial = function () {

};

exports.expose = function (context) {
  exposeOrCleanup(context, false);
};

exports.cleanup = function (context) {
  exposeOrCleanup(context, true);
};

function exposeOrCleanup(context, cleanup) {
  const excludes = ['expose', 'cleanup'];
  Object.keys(exports)
    .filter(key => typeof exports[key] === 'function' && excludes.indexOf(key) === -1)
    .forEach(key => {
      if (cleanup) {
        delete context[key];
      } else {
        context[key] = exports[key];
      }
    })
}

//
// function getMeta() {
//   if (!currentMeta) {
//     currentMeta = new Meta();
//   }
//   return currentMeta;
// }

Object.defineProperty(exports, 'currentSuite', {
  get: () => currentSuite,
  set: suite => currentSuite = suite,
  enumerable: false,
  configurable: false
});
