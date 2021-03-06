/**
 * Base config for self-testing
 */

'use strict';

require('../helpers/globals');
const mergeWith = require('lodash.mergewith');
const SubSheevaRunner = require('../helpers/sub-sheeva');

module.exports = {
  concurrency: 5,
  newSessionPerFile: false,
  splitRunningSuites: true,
  callHookFn: function ({fn, context}) {
    context.options = context.options || {};
    return fn(context);
  },
  callTestFn: function ({fn, context, target}) {
    const run = (code, optionsFromTest = {}) => {
      const subSheevaOptions = mergeWith({delay: target.delay}, context.options, optionsFromTest, customizer);
      return new SubSheevaRunner(code, subSheevaOptions).run();
    };
    return fn(run, context);
  },
};

function customizer(objValue, srcValue) {
  return Array.isArray(srcValue) ? srcValue : undefined;
}
