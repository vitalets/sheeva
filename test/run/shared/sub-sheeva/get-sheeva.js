'use strict';

/**
 * Returns fresh constructor of Sheeva (for parralel self-testing)
 */

const path = require('path');
const SHEEVA_PATH = `../../../../${process.env.SHEEVA_DIR || 'src'}/`;

module.exports = function getSheeva() {
  clearRequireCache();
  return require(SHEEVA_PATH);
};

function clearRequireCache() {
  Object.keys(require.cache).forEach(key => {
    const relpath = path.relative(__dirname, key);
    if (relpath.startsWith(SHEEVA_PATH)) {
      delete require.cache[key];
    }
  });
}
