/**
 * Worker entry
 */

'use strict';

const {START, EXECUTE, END} = require('../messages');

module.exports = function (sheeva) {
  self.addEventListener('message', function (message) {
    const {messageType, messageData} = message.data;

    if (messageType === START) {
      sheeva.prepare();
    }

    if (messageType === EXECUTE) {
      sheeva.execute(messageData)
        .catch(() => {}); // all errors are reported to master
    }

    if (messageType === END) {
      sheeva.end();
    }
  });
};
