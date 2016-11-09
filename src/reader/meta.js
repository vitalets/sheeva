/**
 * Singleton with current meta-info used when applying globals
 */

let info = {};
let tags = [];

exports.setTags = function (newTags) {
  if (newTags && typeof newTags === 'string') {
    newTags = [newTags];
  }
  if (Array.isArray(newTags)) {
    tags = newTags;
  } else {
    throw new Error('Tags should be array');
  }
};

exports.clear = function () {
  info = {};
};

/**
 * Returns options for creating suite/hook/test using current info
 * and filtering by env
 *
 * @param {Object} env
 * @returns {Object<only, skip, serial>}
 */
exports.getOptions = function (env) {
  const options = {
    env,
    serial: info.serial
  };
  if (info.only) {
    options.only = true;
    return options;
  }
  if (tags.length) {
    options.skip = !info.tags || !info.tags.some(tag => tags.indexOf(tag) >= 0);
    if (options.skip) {
      return options;
    }
  }
  if (info.skip) {
    options.skip = info.skip.some(fn => fn(env));
    if (options.skip) {
      return options;
    }
  }
  if (info.if) {
    options.skip = info.if.some(fn => !fn(env));
    if (options.skip) {
      return options;
    }
  }
  return options;
};

exports.only = function () {
  info.only = true;
};

exports.skip = function (fn) {
  info.skip = info.skip ? info.skip.concat([fn]) : [fn];
};

exports.if = function (fn) {
  info.if = info.if ? info.if.concat([fn]) : [fn];
};

exports.tags = function () {
  const args = [].slice.call(arguments);
  info.tags = info.tags ? info.tags.concat(args) : args;
};

exports.serial = function () {
  info.serial = true;
};
