/**
 * Controller for web worker from master side
 */

'use strict';

const {START, EXECUTE, END} = require('../events');
const resolveMap = {
  RUNNER_STARTED: START,
  EXECUTER_END: EXECUTE,
  RUNNER_END: END,
};

module.exports = class Adapter {
  constructor({workerFile, workerIndex}) {
    this._workerFile = workerFile;
    this._workerIndex = workerIndex;
    this._webWorker = null;
    this._resolve = null;
    this._reject = null;
  }
  start() {
    this._webWorker = new window.Worker(this._workerFile);
    this._webWorker.onmessage = event => this._onMessage(event);
    this._webWorker.onerror = event => this._onError(event);
    return this._send(START);
  }
  run(queue) {
    return this._send(EXECUTE, {
      targetId: queue.target.id,
      flatSuiteIndex: queue.index
    });
  }
  end() {
    return this._send(END)
      .finally(() => this._webWorker.terminate());
  }
  _send(type, data) {
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._webWorker.postMessage({type, data});
    });
  }
  _onMessage(event) {
    const data = event.data.data;
    // console.log(`_onMessage ${this._workerIndex} event`, data.event);

    if (resolveMap.hasOwnProperty(data.event)) {
      this._resolve(data);
    }

    // filter only TEST_, HOOK_, SUITE_, ERROR_
    // stringify data
    //reporter.handleEvent(data.event, data);
  }
  _onError(/*event*/) {
    //console.log('_onError', this._workerIndex, event);
    this._reject();
  }
};
