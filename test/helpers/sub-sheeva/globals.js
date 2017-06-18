'use strict';

/**
 * Globals for sub-sheeva
 */

Object.assign(global, {
  noop: function () {},
  sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  sleepError: (ms, err) => global.sleep(ms).then(() => { throw new Error(err); }),
});
