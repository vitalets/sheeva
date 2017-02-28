/**
 * Handling errors in tests / hooks
 */

exports.attachTestToError = function (error, test) {
  return attach(error, 'test', test);
};

exports.attachSuiteToError = function (error, suite) {
  return attach(error, 'suite', suite);
};

exports.getSuiteFromError = function (error) {
  return error.suite;
};

exports.isTestError = function (error) {
  return Boolean(error.test);
};

exports.isHookError = function (error) {
  return Boolean(error.suite);
};

exports.isTestOrHookError = function (error) {
  return exports.isTestError(error) || exports.isHookError(error);
};

function attach(obj, prop, value) {
  Object.defineProperty(obj, prop, {value});
  return obj;
}
