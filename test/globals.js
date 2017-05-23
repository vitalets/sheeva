/**
 * Globals for tests
 */

process.on('unhandledRejection', r => console.error(r)); // eslint-disable-line no-console

require('source-map-support').install();

const expect = require('unexpected');

Object.assign(global, {
  noop: function () {},
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  sleepError: (ms, err) => global.sleep(ms).then(() => { throw new Error(err); }),
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
  }
});
