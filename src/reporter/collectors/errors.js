'use strict';

/**
 * Collects hook and test errors
 */

const state = require('../../state');
const {HOOK_END, TEST_END, EXTRA_ERROR} = require('../../events');

module.exports = class ErrorsCollector {
  constructor() {
    this._errors = state.errors;
  }

  handleEvent(event, data) { // eslint-disable-line complexity
    switch (event) {
      case HOOK_END:
      case TEST_END:
      case EXTRA_ERROR:
        if (data.error && !this._errors.has(data.error)) {
          this._errors.set(data.error, data);
        }
    }
  }
};
