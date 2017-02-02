/**
 * ES6 Set with extra methods
 */

module.exports = class ExtraSet extends Set {
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
    const result = new ExtraSet();
    this.forEach(value => result.add(fn(value)));
    return result;
  }

  /**
   * Maps values via fn to self keys
   *
   * @param {Function} fn
   */
  mapToSelf(fn) {
    this.forEach(value => {
      this.delete(value);
      this.add(fn(value));
    });
  }

  /**
   * Maps values via fn to self keys
   *
   * @param {Function} fn
   */
  mapToArray(fn) {
    const result = [];
    this.forEach(value => result.push(fn(value)));
    return result;
  }
};
