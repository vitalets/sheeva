'use strict';

/**
 * Collects running info about sessions
 */

/* eslint-disable complexity, max-statements */

const {result} = require('../../result');
const {
  SESSION_START,
  SESSION_STARTED,
  SESSION_ENDING,
  SESSION_END,
  SUITE_START,
  TEST_END,
} = require('../../events');

module.exports = class SessionsCollector {
  constructor() {
    this._sessions = result.sessions;
  }

  handleEvent(event, data) {
    switch (event) {
      case SESSION_START: {
        const sessionStat = this._sessions.get(data.session);
        Object.assign(sessionStat, createSessionInfo());
        sessionStat.times.start = data.timestamp;
        break;
      }
      case SESSION_STARTED: {
        const sessionStat = this._sessions.get(data.session);
        sessionStat.times.started = data.timestamp;
        break;
      }
      case SESSION_ENDING: {
        const sessionStat = this._sessions.get(data.session);
        sessionStat.times.ending = data.timestamp;
        break;
      }
      case SESSION_END: {
        const sessionStat = this._sessions.get(data.session);
        sessionStat.times.end = data.timestamp;
        break;
      }
      case SUITE_START: {
        if (!data.suite.parent) {
          const sessionStat = this._sessions.get(data.session);
          sessionStat.files.push(data.suite.name);
        }
        break;
      }
      case TEST_END: {
        const sessionStat = this._sessions.get(data.session);
        sessionStat.testsCount++;
        break;
      }
    }
  }
};

function createSessionInfo() {
  return {
    files: [],
    testsCount: 0,
    times: {
      start: 0,
      started: 0,
      ending: 0,
      end: 0,
    }
  };
}
