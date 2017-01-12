/**
 * Singleton with current meta-info used when applying globals
 */

let info = {};

exports.clear = function () {
  info = {};
};

/**
 * Returns options for creating suite/hook/test using current info
 * and filtering by env
 *
 * @param {Object} env
 * @returns {Object<only, skip, serial>|null}
 */
exports.getOptions = function (env) {
  if (isExcludedByIgnore(env) || isExcludedByIf(env)) {
    return null;
  } else {
    return createOptions();
  }
};

exports.only = function () {
  info.only = true;
};

exports.skip = function () {
  info.skip = true;
};

exports.if = function (fn) {
  assertFn(fn, '$if() should accept function as parameter');
  info.if = info.if ? info.if.concat([fn]) : [fn];
};

exports.ignore = function (fn) {
  assertFn(fn, '$ignore() should accept function as parameter');
  info.ignore = info.ignore ? info.ignore.concat([fn]) : [fn];
};

exports.tags = function () {
  const args = [].slice.call(arguments);
  info.tags = info.tags ? info.tags.concat(args) : args;
};

// todo
exports.serial = function () {
  info.serial = true;
};

function createOptions() {
  return {
    serial: info.serial,
    tags: info.tags,
    only: info.only,
    skip: !info.only && info.skip,
  };
}

function isExcludedByIgnore(env) {
  return info.ignore && info.ignore.some(fn => fn(env));
}

function isExcludedByIf(env) {
  return info.if && info.if.some(fn => !fn(env));
}

function assertFn(value, msg) {
  if (typeof value !== 'function') {
    throw new Error(msg);
  }
}
