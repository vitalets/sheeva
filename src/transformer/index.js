'use strict';

/**
 * Transforms tests:
 * - filters only, skip, tags
 * - flatten and sort
 */

const assert = require('assert');
const state = require('../state');
const filter = require('./filter');
const flatten = require('./flatten');

module.exports = function () {
  assert(state.topSuitesPerTarget.size, 'No top suites');
  filter();
  flatten();
};
