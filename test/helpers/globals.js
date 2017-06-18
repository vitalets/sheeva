'use strict';

/**
 * Globals for main sheeva tests
 */

// use pre-built unexpected as it can not be built with rollup normally
// see: https://github.com/unexpectedjs/unexpected/issues/369
//const expect = require('unexpected/unexpected.js');
const expect = require('unexpected');

Object.assign(global, {
  isSyncTarget: target => !target.hasOwnProperty('delay'),
  isBrowser: target => isTab(target) || isWebWorker(target),
  isTab: target => target.isTab,
  isWebWorker: target => target.isWebWorker,
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
