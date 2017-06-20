/**
 * Master entry
 */

'use strict';

const Controller = require('./controller');

exports.get = function ({workerFile}) {
  return {
    startWorker: function (worker) {
      //console.log('startWorker', worker.index);
      worker.controller = new Controller({workerFile, workerIndex: worker.index});
      return worker.controller.start();
    },
    executeWorkerJob: function (worker) {
      //console.log('executeWorkerJob', worker.queue.topSuite.name);
      return worker.controller.run(worker.queue);
    },
    endWorker: function (worker) {
      //console.log('endWorker', worker.index);
      return worker.controller.end();
    },
  };
};
