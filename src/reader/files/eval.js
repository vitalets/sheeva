/**
 * Files reader used when files provided as objects with `name` and `content` (via eval)
 */

module.exports = class EvalReader {
  constructor() {
    this._content = new Map();
  }
  matchFile(item) {
    const {name, content} = item;
    this._content.set(name, content);
    return [name];
  }
  executeFile(fileName) {
    const content = this._content.get(fileName);
    const f = new Function(content);
    f();
  }
};
