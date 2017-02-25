/**
 * Temp files for running selftests
 */

const fs = require('fs');
const path = require('path');
const TEMP_PATH = './test';

module.exports = class TempFiles {
  constructor(code, session) {
    this._files = [];
    code = Array.isArray(code) ? code : [code];
    code.forEach((content, index) => {
      const tempFile = `${TEMP_PATH}/temp-${session.env.id}-${session.index}-${index}.js`;
      fs.writeFileSync(tempFile, content);
      clearRequireCache(tempFile);
      this._files.push(tempFile);
    });
  }

  get files() {
    return this._files;
  }

  cleanup() {
    this._files.forEach(fs.unlinkSync);
  }
};

function clearRequireCache(file) {
  const absPath = path.resolve(file);
  delete require.cache[absPath];
}
