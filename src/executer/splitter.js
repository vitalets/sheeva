/**
 * Tries split queues between sessions
 */

module.exports = class Splitter {
  constructor(pool) {
    this._pool = pool;
  }

  /**
   * Tries split running sessions for particular free session (same env)
   *
   * @param {Session} session
   */
  trySplitForSession(session) {
    const envState = this._pool.envStates.get(session.env);
    if (envState.splitForSession) {
      const queue = this._trySplit({
        envs: [session.env],
        isSessionStarted: session.started,
      });
      if (!queue) {
        this._markEnvNonSplittable(envState);
      }
      return queue;
    }
  }

  /**
   * 1. Finds all envs that reached end and can be splitted.
   * 2. Finds the worst session and and tries split it to empty slot.
   */
  trySplitForSlot() {
    const envs = this._getEnvsSplittableForSlot();
    if (envs.length) {
      const queue = this._trySplit({
        envs,
        isSessionStarted: false
      });
      if (!queue) {
        this._markEnvsNonSplittableForSlot(envs);
      }
      return queue;
    }
  }

  _trySplit({envs, isSessionStarted}) {
    let maxRemaining = 0;
    let queueToSplit = null;
    this._pool.slots.forEach(session => {
      const queue = session.queue;
      const envOk = envs.some(env => env === queue.suite.env);
      if (!envOk) {
        return;
      }
      const remaining = queue.getRemainingCount();
      if (remaining > maxRemaining) {
        maxRemaining = remaining;
        queueToSplit = queue;
      }
    });

    if (!queueToSplit) {
      return;
    }
    // min tests count may be 2 because we use nextTest in queue
    const minRemaining = queueToSplit.currentIndex === -1 ? 1 : 2;
    if (maxRemaining > minRemaining) {
      const splitCount = Math.floor(maxRemaining / 2);
      const fromIndex = queueToSplit.tests.length - splitCount;
      //console.log(`splitted new queue from ${queueToSplit.suite.name} with ${splitCount} test(s)`);
      return queueToSplit.split(fromIndex);
    }
  }

  _getEnvsSplittableForSlot() {
    const envs = [];
    this._pool.envStates.forEach((envState, env) => {
      if (envState.splitForSlot) {
        envs.push(env);
      }
    });
    return envs;
  }

  _markEnvsNonSplittableForSlot(envs) {
    envs.forEach(env => this._pool.envStates.get(env).splitForSlot = false);
  }

  _markEnvNonSplittable(envState) {
    envState.splitForSession = false;
    // if split is impossible for running session, it's for sure impossible for new session
    // as it requires time for session start
    envState.splitForSlot = false;
  }
};
