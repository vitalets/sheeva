/**
 * Returns constructor of Sheeva.
 * todo: parallel self-testing in browser
 */

// import sheeva as text file
const sheevaCode = require('../../../dist/sheeva.js');
const WrappedCode = `const exports = {}; const module = {}; ${sheevaCode}; return module.exports;`;

module.exports = new Function(WrappedCode);
