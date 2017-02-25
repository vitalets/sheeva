/**
 * Globals
 */

const expect = require('unexpected');

exports.expect = expect;
exports.expectResolve = function (promise, value) {
  return value === undefined
    ? expect(promise, 'to be fulfilled')
    : expect(promise, 'to be fulfilled with value exhaustively satisfying', value);
};
exports.expectReject = function (promise, value) {
  return value === undefined
    ? expect(promise, 'to be rejected')
    : expect(promise, 'to be rejected with error exhaustively satisfying', value);
};
