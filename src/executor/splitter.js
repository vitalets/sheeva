/**
 * Split queues between sessions
 */

module.exports = class Splitter {
    constructor(sessions, existingSession) {
      this._sessions = sessions;
      // this._existingSession = existingSession;
    }

    getQueue() {
      //console.log('try split')
      let maxRemaining = 0;
      let sessionToSplit = null;
      this._sessions.forEach(session => {
        const remaining = session.queue.getRemainingCount();
        //console.log(session.queue.suite.name, remaining);
        if (remaining > maxRemaining) {
          maxRemaining = remaining;
          sessionToSplit = session;
        }
      });
      // min tests count is 2 because we use nextTest in queue
      if (maxRemaining > 2) {
        const queue = sessionToSplit.queue;
        const splitCount = Math.floor(maxRemaining / 2);
        const startFromIndex = queue.tests.length - splitCount;
        //console.log(`splitted new queue from ${queue.suite.name} with ${splitCount} test(s)`);
        return queue.split(startFromIndex);
      }
    }
};
