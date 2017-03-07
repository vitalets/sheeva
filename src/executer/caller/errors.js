/**
 * Handling errors in tests / hooks
 */

exports.attachTestToError = function (error, test) {
  return attach(error, 'test', test);
};

exports.attachHookToError = function (error, hook) {
  return attach(error, 'hook', hook);
};

exports.getSuiteFromError = function (error) {
  return error.hook && error.hook.parent;
};

exports.isTestError = function (error) {
  return Boolean(error.test);
};

exports.isHookError = function (error) {
  return Boolean(error.hook);
};

exports.isTestOrHookError = function (error) {
  return exports.isTestError(error) || exports.isHookError(error);
};

function attach(obj, prop, value) {
  Object.defineProperty(obj, prop, {value});
  return obj;
}
