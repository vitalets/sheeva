'use strict';

/**
 * Includes only specified item paths in topSuites, removing all other
 */

module.exports = class Includer {
  /**
   * Constructor
   *
   * @param {ExtraMap} topSuites
   */
  constructor(topSuites) {
    this._topSuites = topSuites;
  }

  /**
   * Include items with parents
   *
   * @param {ExtraSet} items
   */
  include(items) {
    this._items = items;
    this._setIncludedFlag();
    this._filterTopSuites();
  }

  _setIncludedFlag() {
    this._items.forEach(item => {
      item.parents.forEach(parent => parent.includedParent = true);
    });
  }

  _filterTopSuites() {
    this._topSuites.forEach((suite, key) => {
      const isIncluded = this._isIncluded(suite);
      if (!isIncluded) {
        this._topSuites.delete(key);
      } else {
        delete suite.includedParent;
      }
    });
  }

  _isIncluded(item) {
    return this._isIncludedExplicitly(item) || this._isIncludedParent(item);
  }

  _isIncludedExplicitly(item) {
    return this._items.has(item);
  }

  _isIncludedParent(item) {
    if (item.includedParent) {
      this._includeChildrenWithFlag(item);
      return true;
    } else {
      return false;
    }
  }

  _includeChildrenWithFlag(item) {
    item.children = item.children.filter(child => this._isIncluded(child));
  }
};
