/**
 * Singleton that builds suites tree when applying globals
 */

const Suite = require('./suite');
const Test = require('./test');
const meta = require('./meta');

/**
 * Array of current suites to be filled
 */
let currentSuites = [];
/**
 * Map of fn -> Array<Suites> for found suites (describes)
 */
let subSuites = null;

exports.fillSuites = function fillSuites(suites, fn) {
  currentSuites = suites;
  subSuites = new Map();
  fn();
  // use a copy of subSuites as it will be changed later
  new Map(subSuites).forEach(fillSuites);
};

exports.addSuite = function (name, fn) {
  const addedSuites = [];
  currentSuites.forEach(suite => {
    const options = meta.getOptions(suite.env);
    const subSuite = new Suite(Object.assign({name}, options));
    suite.addChild(subSuite);
    if (!options.skip) {
      addedSuites.push(subSuite);
    }
  });
  if (addedSuites.length) {
    subSuites.set(fn, addedSuites);
  }
  meta.clear();
};

exports.addTest = function (name, fn) {
  currentSuites.forEach(suite => {
    const options = meta.getOptions(suite.env);
    const test = new Test(Object.assign({name, fn}, options));
    suite.addChild(test);
  });
  meta.clear();
};

exports.addHook = function (type, fn) {
  currentSuites.forEach(suite => {
    const options = meta.getOptions(suite.env);
    if (!options.skip) {
      suite.addHook(type, fn);
    }
  });
  meta.clear();
};

