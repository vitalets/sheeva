/**
 * Split queues between sessions
 */

module.exports = class Splitter {
    constructor(slots, existingSession) {
      this._slots = slots;
      // this._existingSession = existingSession;
    }

    getQueue() {
      //console.log('try split')
      let maxRemaining = 0;
      let queueToSplit = null;
      this._slots.forEach(queue => {
        const remaining = queue.getRemainingCount();
        //console.log(session.queue.suite.name, remaining);
        if (remaining > maxRemaining) {
          maxRemaining = remaining;
          queueToSplit = queue;
        }
      });
      // min tests count is 2 because we use nextTest in queue
      if (maxRemaining > 2) {
        const splitCount = Math.floor(maxRemaining / 2);
        const startFromIndex = queueToSplit.tests.length - splitCount;
        //console.log(`splitted new queue from ${queue.suite.name} with ${splitCount} test(s)`);
        return queueToSplit.split(startFromIndex);
      }
    }
};
