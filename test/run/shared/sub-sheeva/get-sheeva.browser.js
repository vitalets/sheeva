'use strict';

/**
 * Returns fresh constructor of Sheeva.
 */

// import sheeva as text file to be able to re-evaluate it
const sheevaCode = require('../../../../dist/sheeva.js');
const WrappedCode = `const exports = {}; const module = {}; ${sheevaCode}; return module.exports;`;

module.exports = new Function(WrappedCode);
