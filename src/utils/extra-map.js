/**
 * ES6 Map with extra methods
 */

const ExtraSet = require('./extra-set');

module.exports = class ExtraMap extends Map {
  /**
   * Converts Map/Set to array
   * Array.from not supported in some browsers yet
   * See: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/from
   */
  toArray() {
    const result = [];
    this.forEach(value => result.push(value));
    return result;
  }

  /**
   * Maps values via fn to new ExtraMap
   *
   * @param {Function} fn
   * @returns {ExtraMap}
   */
  map(fn) {
    const result = new ExtraMap();
    this.forEach((value, key) => result.set(key, fn(value, key, this)));
    return result;
  }

  /**
   * Maps values via fn to self keys
   *
   * @param {Function} fn
   */
  mapToSelf(fn) {
    this.forEach((value, key) => this.set(key, fn(value, key, this)));
  }

  /**
   * If key does not exist new array will be created and returned.
   *
   * @param {*} key
   */
  getOrCreateArray(key) {
    let value = this.get(key);
    if (!value) {
      value = [];
      this.set(key, value);
    }
    return value;
  }

  /**
   * If key does not exist new Set will be created and returned.
   *
   * @param {*} key
   */
  getOrCreateSet(key) {
    let value = this.get(key);
    if (!value) {
      value = new ExtraSet();
      this.set(key, value);
    }
    return value;
  }

  /**
   * Push value into array for specified key of map.
   * Array is created if needed.
   *
   * @param {*} key
   * @param {*} value
   */
  pushToKey(key, value) {
    const arr = this.get(key);
    if (arr) {
      arr.push(value);
    } else {
      this.set(key, [value]);
    }
  }
};
