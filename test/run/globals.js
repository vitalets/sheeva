/**
 * Globals for main sheeva tests
 */

const expect = require('unexpected');

Object.assign(global, {
  IS_NODE: !process.browser,
  IS_BROWSER: process.browser,
  IS_WEB_WORKER: typeof self !== 'undefined',
  expect,
  expectResolve: function (promise, value) {
    return value === undefined
      ? expect(promise, 'to be fulfilled')
      : expect(promise, 'to be fulfilled with value exhaustively satisfying', value);
  },
  expectReject: function (promise, value) {
    if (value === undefined) {
      return expect(promise, 'to be rejected');
    } else if (typeof value === 'string') {
      return expect(promise, 'to be rejected with', value);
    } else {
      return expect(promise, 'to be rejected with error exhaustively satisfying', value);
    }
  },
});
