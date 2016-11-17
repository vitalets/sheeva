/**
 * Counts START / END events for collection and emits initial / final events
 */

module.exports = class Counter {
  constructor() {
    this.isFirst = true;
    this.isLast = false;
    this.isFirstForId = true;
    this.isLastForId = false;
    this._items = new Map();
  }
  handleStartEvent(id) {
    let counter = this._items.get(id) || 0;
    counter++;
    this.isFirst = !this._items.size;
    this.isFirstForId = counter === 1;
    this._items.set(id, counter);
  }
  handleEndEvent(id) {
    let counter = this._items.get(id);
    if (typeof counter !== 'number') {
      throw new Error('Got END event before START');
    }
    counter--;
    if (counter) {
      this._items.set(id, counter);
      this.isLastForId = false;
    } else {
      this._items.delete(id);
      this.isLastForId = true;
      this.isLast = !this._items.size;
    }
  }
};
