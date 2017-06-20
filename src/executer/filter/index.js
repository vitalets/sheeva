/**
 * Filters flat suites by locator
 *
 * @typedef {Object} Locator
 * @property {String} targetId
 * @property {Number} flatSuiteIndex
 */

'use strict';

const assert = require('assert');
const state = require('../../state');

module.exports = class Filter {
  /**
   * Constructor
   *
   * @param {Locator} [locator]
   */
  constructor(locator) {
    this._flatSuitesPerTarget = state.flatSuitesPerTarget;
    this._filteredFlatSuitesPerTarget = state.filteredFlatSuitesPerTarget;
    this._locator = locator;
    assert(this._flatSuitesPerTarget, 'No suites found. Ensure you called prepare().');
    this._filteredFlatSuitesPerTarget.clear();
  }

  apply() {
    if (this._locator) {
      this._filterByLocator();
    } else {
      this._copy();
    }
  }

  _filterByLocator() {
    const {targetId, flatSuiteIndex} = this._locator;
    for (let [target, flatSuites] of this._flatSuitesPerTarget.entries()) {
      if (target.id === targetId) {
        const filteredFlatSuites = flatSuites.slice(flatSuiteIndex, flatSuiteIndex + 1);
        assert(filteredFlatSuites.length, `Invalid flatSuiteIndex: ${flatSuiteIndex}, max: ${flatSuites.length - 1}`);
        this._filteredFlatSuitesPerTarget.set(target, filteredFlatSuites);
        return;
      }
    }
    throw new Error(`Unknown target.id: ${targetId}`);
  }

  _copy() {
    this._flatSuitesPerTarget.forEach((flatSuites, target) => {
      this._filteredFlatSuitesPerTarget.set(target, flatSuites);
    });
  }
};
