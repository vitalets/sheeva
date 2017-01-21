/**
 * Cleans roots to keep / remove items
 */

module.exports = class Cleaner {
  constructor(roots) {
    this._roots = roots;
    this._items = null;
  }

  keepItems(items) {
    this._items = items;
    this._keepParents();
    return this._clean(this._roots);
  }

  removeItems(items) {
    this._items = items;
    this._removeFromParents();
    return this._roots;
  }

  _keepParents() {
    this._items.forEach(item => item.parents.forEach(parent => parent.keep = true));
  }

  _clean(items) {
    return items.filter(item =>  this._isKeepItem(item) || this._isKeepParent(item));
  }

  _isKeepItem(item) {
    return this._items.indexOf(item) >= 0;
  }

  _isKeepParent(item) {
    if (item.keep && item.children) {
      item.children = this._clean(item.children);
    }
    return item.keep;
  }

  _removeFromParents() {
    this._items.forEach(item => {
      const index = item.parent.children.indexOf(item);
      item.parent.children.splice(index, 1);
    });
  }
};
