/**
 * Base config for self-testing
 */

'use strict';

require('./globals');

module.exports = {
  concurrency: 5,
  newSessionPerFile: false,
  splitSuites: true,
  callHookFn: function ({fn, context}) {
    context.runOptions = context.runOptions || {};
    return fn(context);
  }
};
