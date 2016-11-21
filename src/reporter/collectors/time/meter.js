/**
 * Collects START / END data for items
 */

module.exports = class TimeMeter {
  constructor() {
    this._map = new Map();
    this._avgTime = null;
  }
  handleStartEvent(event, {session, timestamp}) {
    let info = this._map.get(session);
    if (!info) {
      info = {
        times: [],
        lastStart: null,
      };
      this._map.set(session, info);
    }
    info.lastStart = timestamp;
  }
  handleEndEvent(event, {session, timestamp}) {
    const info = this._map.get(session);
    if (!info || info.lastStart === null) {
      throw new Error(`Got ${event} event before corresponding start event`);
    }
    const time = timestamp - info.lastStart;
    info.times.push(time);
    info.lastStart = null;
  }
  get avgTime() {
    if (this._avgTime === null) {
      const sessionTimes = [];
      this._map.forEach(info => sessionTimes.push(arrayAvg(info.times)));
      this._avgTime = arrayAvg(sessionTimes);
    }
    return this._avgTime;
  }
};

function arrayAvg(arr) {
  const total = arr.reduce((res, v) => res + v, 0);
  return arr.length ? Math.round(total / arr.length) : 0;
}
