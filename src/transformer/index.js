/**
 * Transforms tests:
 * - filters only, skip, tags
 * - flatten and sort
 */

const filter = require('./filter');
const flatten = require('./flatten');

module.exports = function () {
  filter();
  flatten();
};
