'use strict';

/**
 * Returns fresh constructor of Sheeva.
 */

module.exports = function () {
  delete require.cache[require.resolve('../../../../dist/sheeva')];
  return require('../../../../dist/sheeva');
};
