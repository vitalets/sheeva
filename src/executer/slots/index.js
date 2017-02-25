/**
 * Slots manager
 */

const ExtraSet = require('../../utils/extra-set');
const {config} = require('../../configurator');
const Slot = require('./slot');

module.exports = class Slots {
  /**
   * Constructor
   *
   * @param {Object} handlers
   * @param {Function} handlers.onFreeSlot
   * @param {Function} handlers.onEmpty
   */
  constructor(handlers) {
    this._handlers = handlers;
    this._slots = new ExtraSet();
  }

  toArray() {
    return this._slots.toArray();
  }

  fill() {
    while (!this._isConcurrencyReached()) {
      const slot = this._add();
      const queue = this._handlers.onFreeSlot(slot);
      if (!queue) {
        break;
      }
    }
  }

  delete(slot) {
    return slot.deleteSession()
      .then(() => {
        this._slots.delete(slot);
        this._checkEmpty();
      })
  }

  /**
   * Terminates all slot sessions and ignore other errors in favor of first runner error
   */
  terminate() {
    const tasks = this._slots.mapToArray(slot => slot.deleteSession().catch());
    this._slots.clear();
    return Promise.all(tasks);
  }

  _isConcurrencyReached() {
    return config.concurrency && this._slots.size === config.concurrency;
  }

  _add() {
    const slot = new Slot(this._slots.size, this._handlers);
    this._slots.add(slot);
    return slot;
  }

  _checkEmpty() {
    if (this._slots.size === 0) {
      this._handlers.onEmpty()
    }
  }
};
