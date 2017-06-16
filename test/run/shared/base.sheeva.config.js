/**
 * Base config for self-testing
 */

'use strict';

require('./globals');
const mergeWith = require('lodash.mergewith');
const SubSheevaRunner = require('./sub-sheeva');

module.exports = {
  concurrency: 5,
  newSessionPerFile: false,
  splitSuites: true,
  callHookFn: function ({fn, context}) {
    context.runOptions = context.runOptions || {};
    return fn(context);
  },
  callTestFn: function ({fn, context, target}) {
    const run = (code, optionsFromTest = {}) => {
      const subSheevaOptions = mergeWith({delay: target.delay}, context.runOptions, optionsFromTest, customizer);
      return new SubSheevaRunner(code, subSheevaOptions).run();
    };
    return fn(run);
  },
};

function customizer(objValue, srcValue) {
  return Array.isArray(srcValue) ? srcValue : undefined;
}
