/**
 * Split queues between sessions
 */

module.exports = class Splitter {
    constructor(queues) {
      this._queues = queues;
      this._envs = [];
    }

    splitForSession(session) {
      //console.log('splitForSession');
      this._envs = [session.env];
      return this._getQueue({isSessionStarted: true});
    }

    splitForEnvs(envs) {
      //console.log('splitForEnvs');
      this._envs = envs;
      return this._getQueue({isSessionStarted: false});
    }

    _getQueue({isSessionStarted}) {
      const queues = this._queues.filter(queue => this._envs.some(env => env === queue.suite.env));
      let maxRemaining = 0;
      let queueToSplit = null;
      queues.forEach(queue => {
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
