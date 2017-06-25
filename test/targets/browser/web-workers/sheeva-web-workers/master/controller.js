/**
 * Controller for web worker from master side
 */

'use strict';

const {START, EXECUTE, END} = require('../messages');
const resolveMap = {
  RUNNER_STARTED: START,
  EXECUTER_END: EXECUTE,
  RUNNER_END: END,
};

module.exports = class Adapter {
  constructor({workerUrl, workerIndex, emit}) {
    this._workerUrl = workerUrl;
    this._workerIndex = workerIndex;
    this._emit = emit;
    this._webWorker = null;
    this._resolve = null;
    this._reject = null;
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
    return this._postMessage(END)
      .finally(() => this._webWorker.terminate());
  }
  _postMessage(messageType, messageData) {
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._webWorker.postMessage({messageType, messageData});
    });
  }
  _onMessage(message) {
    const {messageData} = message.data;
    const {event, data} = messageData;
    // console.log(event)
    if (resolveMap.hasOwnProperty(event)) {
      this._resolve(data);
    } else {
      // TEST_, HOOK_, SUITE_, EXTRA_ERROR
      this._emit(event, data);
    }
  }
  _onError(/*event*/) {
    // console.log('_onError', this._workerIndex, event);
    this._reject();
  }
};
