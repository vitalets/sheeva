/**
 * Exclude specified items from parents
 */

module.exports = class Excluder {
  exclude(items) {
    this._items = items;
    this._removeFromParent();
  }

  _removeFromParent() {
    this._items.forEach(item => {
      const children = item.parent.children;
      const index = children.indexOf(item);
      children.splice(index, 1);
    });
  }
};
