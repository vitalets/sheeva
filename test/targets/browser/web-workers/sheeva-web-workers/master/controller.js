/**
 * Controller for web worker from master side
 */

'use strict';

const Pendings = require('pendings');
const {START, EXECUTE, END} = require('../messages');
const resolveMap = {
  RUNNER_STARTED: START,
  EXECUTER_END: EXECUTE,
  RUNNER_END: END,
};

module.exports = class Controller {
  constructor({workerUrl, workerIndex, emit}) {
    this._workerUrl = workerUrl;
    this._workerIndex = workerIndex;
    this._emit = emit;
    this._webWorker = null;
    this._pendings = new Pendings();
    this._isEnding = false;
  }
  start() {
    this._webWorker = new window.Worker(this._workerUrl, {name: `Worker ${this._workerIndex}`});
    this._webWorker.onmessage = event => this._onMessage(event);
    this._webWorker.onerror = event => this._onError(event);
    return this._postMessage(START);
  }
  run(queue) {
    return this._postMessage(EXECUTE, {
      targetId: queue.target.id,
      flatSuiteIndex: queue.index,
      name: queue.topSuite.name,
      testsCount: queue.tests.length,
    });
  }
  end() {
    this._isEnding = true;
    return this._postMessage(END)
      .finally(() => this._webWorker.terminate());
  }
  _postMessage(messageType, messageData) {
    return this._pendings.set(messageType, () => {
      // console.info('to worker', this._workerIndex, messageType)
      this._webWorker.postMessage({messageType, messageData});
    });
  }
  _onMessage(message) {
    const {messageData} = message.data;
    const {event, data} = messageData;
    // console.info('from worker', this._workerIndex, event, data.error)
    const messageType = resolveMap[event];
    if (messageType && this._pendings.has(messageType)) {
      if (data.error) {
        this._pendings.reject(messageType, data.error);
      } else {
        this._pendings.resolve(messageType, data);
      }
    } else {
      // TEST_, HOOK_, SUITE_, EXTRA_ERROR
      if (!this._isEnding) {
        this._emit(event, data);
      }
    }
  }
  _onError(event) {
    this._pendings.rejectAll(event);
  }
};
