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
   * @param {Sessions} sessions
   */
  constructor(sessions) {
    this._sessions = sessions;
    this._slots = new ExtraSet();
    this._terminating = false;
    this._onEmpty = () => {};
    this._onFreeSlot = () => {};
    this._onSessionStart = () => {};
    this._onSessionEnd = () => {};
  }

  set onEmpty(handler) {
    this._onEmpty = handler;
  }

  set onFreeSlot(handler) {
    this._onFreeSlot = handler;
  }

  set onSessionStart(handler) {
    this._onSessionStart = handler;
  }

  set onSessionEnd(handler) {
    this._onSessionEnd = handler;
  }

  toArray() {
    return this._slots.toArray();
  }

  fill() {
    while (!this._isConcurrencyReached()) {
      const slot = this._createSlot();
      const queue = this._onFreeSlot(slot);
      if (!queue) {
        break;
      }
    }
  }

  delete(slot) {
    return slot.deleteSession()
      .then(() => this._destroySlot(slot))
      .then(() => this._terminating ? null : this._checkEmpty());
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

  _createSlot() {
    const slotIndex = this._slots.size;
    const slot = new Slot(slotIndex, this._sessions);
    slot.onSessionStart = this._onSessionStart;
    slot.onSessionEnd = this._onSessionEnd;
    this._slots.add(slot);
    reporter.handleEvent(SLOT_ADD, {slot});
    return slot;
  }

  _destroySlot(slot) {
    this._slots.delete(slot);
    reporter.handleEvent(SLOT_DELETE, {slot});
  }

  _checkEmpty() {
    if (this._slots.size === 0) {
      this._onEmpty();
    }
  }
};
