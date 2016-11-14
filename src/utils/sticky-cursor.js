/**
 * Sticks terminal cursor to current positiion and allows to update lines below
 *
 * @type {StickyCursor}
 */

const clc = require('cli-color');
const EOL = require('os').EOL;

module.exports = class StickyCursor {
  constructor () {
    // height of block where we are working now
    this._height = 0;
  }

  unstick() {
    this._down(this._height + 1);
  }

  write(row, str) {
    this._down(row);
    process.stdout.write(clc.erase.line);
    process.stdout.write(clc.move.left(clc.windowSize.width));
    process.stdout.write(str);
    this._up(row);
  }

  _up(n) {
    process.stdout.write(clc.move.up(n));
  }

  _down(n) {
    for (let i = 0; i < n; i++) {
      if (i < this._height) {
        process.stdout.write(clc.move.down(n));
      } else {
        process.stdout.write(EOL);
        this._height++;
      }
    }
  }
};
