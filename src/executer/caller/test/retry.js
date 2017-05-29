'use strict';

/**
 * Manage info about test retry.
 */

const {config} = require('../../../config');
const Fn = require('../shared/fn');

const RETRY_TIMEOUT_INCREASE_FACTOR = 1.5;

module.exports = class Retry {
  constructor(test) {
    this.planned = false;
    this._test = test;
    this._attempt = 0;
    this._timeout = this._test.timeout || config.timeout;
  }

  get attempt() {
    return this._attempt;
  }

  get timeout() {
    return this._timeout;
  }

  isPossible() {
    return this._test.retry && this._attempt < this._test.retry;
  }

  increaseValues(error) {
    this._increaseAttempt();
    if (error instanceof Fn.TimeoutError) {
      this._increaseTimeout();
    }
  }

  _increaseAttempt() {
    this._attempt++;
  }

  _increaseTimeout() {
    this._timeout = Math.round(this._timeout * RETRY_TIMEOUT_INCREASE_FACTOR);
  }
};
