/**
 * Executor
 */

exports.callArray = function (arr) {
  try {
    arr.forEach(fn => fn());
  } catch(e) {
    console.log('error', e);
    return e;
  }
};
