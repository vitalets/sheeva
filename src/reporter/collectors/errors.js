/**
 * Collects assertion errors and hook errors
 */

const events = require('../../events');

module.exports = class ErrorsCollector {
  constructor() {
    this.errors = [];
  }
  handleEvent(event, {error}) {
    switch (event) {
      case events.HOOK_END:
      case events.TEST_END:
        if (error) {
          this.errors.push(error);
        }
    }
  }
};
