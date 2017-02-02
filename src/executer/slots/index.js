/**
 * Slots manager
 */

const ExtraSet = require('../../utils/extra-set');
const Base = require('../../base');
const Slot = require('./slot');

module.exports = class Slots extends Base {
  /**
   * Constructor
   *
   * @param {Sessions} sessions
   * @param {Object} handlers
   * @param {Function} handlers.onFreeSlot
   * @param {Function} handlers.onEmpty
   */
  constructor(sessions, handlers) {
    super();
    this._sessions = sessions;
    this._handlers = handlers;
    this._slots = new ExtraSet();
  }

  fill() {
    while (this._hasFree()) {
      const slot = this._add();
      const queue = this._handlers.onFreeSlot(slot);
      if (!queue) {
        break;
      }
    }
  }

  remove(slot) {
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
    // use empty catch() to ignore error while closing slot session to keep original error
    const tasks = this._slots.mapToArray(slot => slot.deleteSession().catch());
    this._slots.clear();
    return Promise.all(tasks);
  }

  /**
   * Some slot sessions may be in starting / ending state, when they dont have
   *
   * @returns {Array}
   */
  getWithQueues() {
    return this._slots.toArray()
      .filter(slot => slot.session && slot.session.queue);
  }

  getForEnv(env) {
    return this._slots.toArray()
      .filter(slot => slot.session && slot.session.env === env);
  }

  _hasFree() {
    return !this._config.concurrency || this._slots.size < this._config.concurrency;
  }

  _add() {
    const slot = new Slot(this._sessions).setBaseProps(this);
    this._slots.add(slot);
    return slot;
  }

  _checkEmpty() {
    if (this._slots.size === 0) {
      this._handlers.onEmpty()
    }
  }
};
