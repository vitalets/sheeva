/**
 * Includes only specified items in topSuites, removing all other
 */

module.exports = class Includer {

  constructor(topSuites) {
    this._topSuites = topSuites;
    this._items = null;
  }

  include(items) {
    this._items = items;
    this._setIncludeFlag();
    return this._includeWithFlag(this._topSuites);
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
    if (item.isSuite) {
      item.children = this._includeWithFlag(item.children);
    }
  }
};