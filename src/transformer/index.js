/**
 * Transforms tests:
 * - filters only, skip, tags
 * - flatten and sort
 */

const assert = require('assert');
const {result} = require('../result');
const filter = require('./filter');
const flatten = require('./flatten');

module.exports = function () {
  assert(result.topSuitesPerTarget.size, 'No top suites');
  filter();
  flatten();
};
