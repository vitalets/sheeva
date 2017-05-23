/**
 * Transforms tests:
 * - filters only, skip, tags
 * - flatten and sort
 */

const {result} = require('../result');
const filter = require('./filter');
const flatten = require('./flatten');

module.exports = function () {
  if (result.topSuitesPerTarget.size > 0) {
    filter();
    flatten();
  } else {
    throw new Error('No files matched');
  }
};
