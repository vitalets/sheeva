/**
 * Slots manager
 */

const ExtraSet = require('../../utils/extra-set');
const {config} = require('../../configurator');
const reporter = require('../../reporter');
const {SLOT_ADD, SLOT_DELETE} = require('../../events');
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
    this._terminating = false;
  }

  toArray() {
    return this._slots.toArray();
  }

  fill() {
    while (!this._isConcurrencyReached()) {
      const slot = this._addSlotToSet();
      const queue = this._handlers.onFreeSlot(slot);
      if (!queue) {
        break;
      }
    }
  }

  delete(slot) {
    return slot.deleteSession()
      .then(() => this._removeSlotFromSet(slot))
      .then(() => this._terminating ? null : this._checkEmpty())
  }

  /**
   * Terminates all slot sessions and ignore other errors in favor of first runner error
   */
  terminate() {
    this._terminating = true;
    const tasks = this._slots.mapToArray(slot => this.delete(slot).catch(() => {}));
    return Promise.all(tasks);
  }

  _isConcurrencyReached() {
    return config.concurrency && this._slots.size === config.concurrency;
  }

  _addSlotToSet() {
    const slot = new Slot(this._slots.size, this._handlers);
    this._slots.add(slot);
    reporter.handleEvent(SLOT_ADD, {slot});
    return slot;
  }

  _removeSlotFromSet(slot) {
    this._slots.delete(slot);
    reporter.handleEvent(SLOT_DELETE, {slot});
  }

  _checkEmpty() {
    if (this._slots.size === 0) {
      this._handlers.onEmpty()
    }
  }
};
