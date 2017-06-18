'use strict';

/**
 * Returns fresh constructor of Sheeva (for parallel self-testing)
 */

const path = require('path');
const sheevaDir = process.env.SHEEVA_DIR || 'src';
const sheevaPath = `../../../${sheevaDir}/`;

module.exports = function getSheeva() {
  Object.keys(require.cache).forEach(key => {
    const relpath = path.relative(__dirname, key);
    if (relpath.startsWith(sheevaPath)) {
      delete require.cache[key];
    }
  });
  return require(sheevaPath);
};
