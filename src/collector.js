/**
 * Collects events from several sessions
 */

const events = require('./events');

module.exports = class Collector {
  constructor() {
    this.suites = new Map();
    this.info = {};
  }
  update(event, data) {
    console.log('collector', event)
  }
};
