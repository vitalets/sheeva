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
    // cursor is always on maxRow
    this._maxRow = 0;
  }

  write(row, str) {
    this._ensureRow(row);
    this._upTo(row);
    process.stdout.write(clc.erase.line);
    process.stdout.write(clc.move.left(clc.windowSize.width));
    process.stdout.write(str);
    this._downFrom(row);
  }

  _upTo(row) {
    process.stdout.write(clc.move.up(this._maxRow - row));
  }

  _ensureRow(row) {
    for (let i = this._maxRow; i < row + 1; i++) {
      process.stdout.write(EOL);
      this._maxRow++;
    }
  }

  _downFrom(row) {
    process.stdout.write(clc.move.down(this._maxRow - row));
    process.stdout.write(clc.move.left(clc.windowSize.width));
  }
};
