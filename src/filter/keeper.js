/**
 * Keeps only specified items in fileSuites, removing all other
 */

module.exports = class Keeper {

  constructor(fileSuites) {
    this._fileSuites = fileSuites;
    this._items = null;
  }

  keep(items) {
    this._items = items;
    this._setKeepFlag();
    this._keepWithFlag(this._fileSuites);
    return this._fileSuites;
  }

  _setKeepFlag() {
    this._items.forEach(item => {
      item.parents.forEach(parent => parent.keep = true);
    });
  }

  _keepWithFlag(items) {
    return items.filter(item => this._isKeepItem(item) || this._isKeepParent(item));
  }

  _isKeepItem(item) {
    return this._items.indexOf(item) >= 0;
  }

  _isKeepParent(item) {
    if (item.keep) {
      this._keepChildren(item);
      return true;
    } else {
      return false;
    }
  }

  _keepChildren(item) {
    if (item.children) {
      item.children = this._keepWithFlag(item.children);
    }
  }
};
