/**
 * Collects hook and test errors
 */

const {result} = require('../../result');
const {HOOK_END, TEST_END} = require('../../events');

module.exports = class ErrorsCollector {
  constructor() {
    this._errors = result.errors;
  }

  handleEvent(event, data) {
    switch (event) {
      case HOOK_END:
      case TEST_END:
        if (data.error && !this._errors.has(data.error)) {
          this._errors.set(data.error, data);
        }
    }
  }
};
