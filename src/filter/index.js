/**
 * Filters suites and tests by:
 * - only
 * - skip
 * - tags
 */

module.exports = class Filter {
  constructor() {
    this._envSuites = new Map();
    this._files = [];
  }
  process(envSuites) {
    if (this._hasOnly()) {
      this._filter();
    }
    return this;
  }
  _hasOnly() {
    for (let suites of this._envSuites.values()) {
      const hasOnly = suites.some(suite => suite.hasOnly);
      if (hasOnly) {
        return true;
      }
    }
    return false;
  }
  _filter() {
    this._envSuites.forEach((suites, env) => {
      suites = suites.filter(extractOnly);
      this._envSuites.set(env, suites);
      this._addToFiles(suites);
    });
  }
};
