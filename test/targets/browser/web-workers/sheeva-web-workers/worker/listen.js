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
      // console.log(messageData)
      const {targetId, flatSuiteIndex} = messageData;
      sheeva.execute({targetId, flatSuiteIndex});
    }

    if (messageType === END) {
      sheeva.end();
    }
  });
};
