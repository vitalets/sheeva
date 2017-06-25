/**
 * Master entry
 */

'use strict';

const Controller = require('./controller');

/**
 * Pre-fetching worker content and creating via ObjectURL
 * (this is faster than simply creating workers by direct url)
 */
exports.get = function ({workerUrl}) {
  return {
    startRunner: function (config) {
      return window.fetch(workerUrl)
        .then(response => response.text())
        .then(text => {
          const blob = new Blob([text]);
          config.workerUrl = URL.createObjectURL(blob);
        });
    },
    endRunner: function (config) {
      URL.revokeObjectURL(config.workerUrl);
    },
    startWorker: function (worker, config) {
      worker.controller = new Controller({
        workerUrl: config.workerUrl,
        workerIndex: worker.index,
      });
      return worker.controller.start();
    },
    executeWorkerJob: function (worker) {
      return worker.controller.run(worker.queue);
    },
    endWorker: function (worker) {
      return worker.controller.end();
    },
  };
};

/**
 * Simply creating workers by direct URL (slower, but shows source-maps)
 */
exports.getSimple = function ({workerUrl}) {
  return {
    startWorker: function (worker) {
      worker.controller = new Controller({
        workerUrl,
        workerIndex: worker.index,
        emit: (event, data) => worker.session.emit(event, data),
      });
      return worker.controller.start();
    },
    executeWorkerJob: function (worker) {
      return worker.controller.run(worker.queue);
    },
    endWorker: function (worker) {
      return worker.controller.end();
    },
  };
};
