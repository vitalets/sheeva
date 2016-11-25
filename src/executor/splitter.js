/**
 * Split queues between sessions
 */

module.exports = class Splitter {
    constructor(queues) {
      this._queues = queues;
    }

    trySplit({envs, isSessionStarted}) {
      const queues = this._queues.filter(queue => envs.some(env => env === queue.suite.env));
      let maxRemaining = 0;
      let queueToSplit = null;
      queues.forEach(queue => {
        const remaining = queue.getRemainingCount();
        //console.log(queue.suite.name, remaining);
        if (remaining > maxRemaining) {
          maxRemaining = remaining;
          queueToSplit = queue;
        }
      });
      // min tests count is 2 because we use nextTest in queue
      if (maxRemaining > 2) {
        const splitCount = Math.floor(maxRemaining / 2);
        const fromIndex = queueToSplit.tests.length - splitCount;
        //console.log(`splitted new queue from ${queueToSplit.suite.name} with ${splitCount} test(s)`);
        return queueToSplit.split(fromIndex);
      }
    }
};
