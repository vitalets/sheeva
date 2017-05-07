/**
 * Filters suites by:
 * - only
 * - skip
 * - tags
 */

const Only = require('./only');
const Skip = require('./skip');
const Tags = require('./tags');

module.exports = function () {
  const only = new Only();
  if (only.found) {
    only.filter();
  } else {
    new Tags().filter();
    new Skip().filter();
  }
};
