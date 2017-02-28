/**
 * Excludes specified items from fileSuites
 */

module.exports = class Excluder {

  constructor(fileSuites) {
    this._fileSuites = fileSuites;
    this._items = null;
  }

  exclude(items) {
    this._items = items;
    this._removeFromParents();
    return this._fileSuites;
  }

  _removeFromParents() {
    this._items.forEach(item => {
      const index = item.parent.children.indexOf(item);
      item.parent.children.splice(index, 1);
    });
  }
};