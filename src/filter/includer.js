/**
 * Includes only specified items in fileSuites, removing all other
 */

module.exports = class Includer {

  constructor(fileSuites) {
    this._fileSuites = fileSuites;
    this._items = null;
  }

  include(items) {
    this._items = items;
    this._setIncludeFlag();
    return this._includeWithFlag(this._fileSuites);
  }

  _setIncludeFlag() {
    this._items.forEach(item => {
      item.parents.forEach(parent => parent.include = true);
    });
  }

  _includeWithFlag(items) {
    return items.filter(item => this._isIncludeItem(item) || this._isIncludeParent(item));
  }

  _isIncludeItem(item) {
    return this._items.indexOf(item) >= 0;
  }

  _isIncludeParent(item) {
    if (item.include) {
      this._includeChildrenWithFlag(item);
      return true;
    } else {
      return false;
    }
  }

  _includeChildrenWithFlag(item) {
    if (item.children) {
      item.children = this._includeWithFlag(item.children);
    }
  }
};
