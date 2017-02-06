/**
 * Collects hook and test errors
 */

const events = require('../../events');

module.exports = class ErrorsCollector {
  constructor() {
    this._errors = [];
  }

  get errors() {
    return this._errors;
  }

  handleEvent(event, {error}) {
    switch (event) {
      case events.HOOK_END:
      case events.TEST_END:
        if (error) {
          this._errors.push(error);
        }
    }
  }
};
