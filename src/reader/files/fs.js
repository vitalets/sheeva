'use strict';

/**
 * Files reader for Node.js (via require call)
 */

const path = require('path');
const glob = require('glob');

exports.matchFile = function (str) {
  const isPattern = str.indexOf('*') >= 0;
  const isFile = /\.[a-z]{1,3}$/i.test(str);
  if (!isPattern && !isFile) {
    str = path.join(str, '**');
  }
  return glob.sync(str, {nodir: true});
};

exports.executeFile = function (filename) {
  require(path.resolve(filename));
};
