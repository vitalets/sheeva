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
   * @param {Sessions} sessions
   * @param {Object} handlers
   * @param {Function} handlers.onFreeSlot
   * @param {Function} handlers.onEmpty
   */
  constructor(sessions, handlers) {
    this._sessions = sessions;
    this._handlers = handlers;
    this._slots = new ExtraSet();
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
      .filter(slot => slot.queue)
  }

  /**
   * Get slots with sessions of specified env
   *
   * @returns {Array}
   */
  getForEnv(env) {
    return this._slots.toArray()
      .filter(slot => slot.session && slot.session.env === env);
  }

  _isConcurrencyReached() {
    return config.concurrency && this._slots.size === config.concurrency;
  }

  _add() {
    const slot = new Slot(this._sessions);
    this._slots.add(slot);
    return slot;
  }

  _checkEmpty() {
    if (this._slots.size === 0) {
      this._handlers.onEmpty()
    }
  }
};
