/**
 * Sticks to some line in terminal and allows to update all lines below later
 *
 * @type {StickyCursor}
 */

const clc = require('cli-color');
const EOL = require('os').EOL;

module.exports = class StickyCursor {
  constructor () {
    // height of block where we are working now
    this._currentRow = 0;
  }

  write(row, str) {
    this._addLines(row);
    this._upTo(row);
    process.stdout.write(clc.erase.line);
    process.stdout.write(clc.move.left(clc.windowSize.width));
    process.stdout.write(str);
    this._returnFrom(row);
  }

  _upTo(row) {
    process.stdout.write(clc.move.up(this._currentRow - row));
  }

  _addLines(row) {
    for (let i = this._currentRow; i < row + 1; i++) {
      process.stdout.write(EOL);
      this._currentRow++;
    }
  }

  _returnFrom(row) {
    process.stdout.write(clc.move.down(this._currentRow - row));
    process.stdout.write(clc.move.left(clc.windowSize.width));
  }
};
