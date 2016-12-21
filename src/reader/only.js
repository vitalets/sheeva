/**
 * Looks for `only` and filter tests (envSuites)
 */

module.exports = class Only {
  constructor(envSuites) {
    this._envSuites = envSuites;
    this._files = [];
  }
  get files() {
    return this._files;
  }
  process() {
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
  _addToFiles(suites) {
    suites.forEach(suite => this._files.indexOf(suite.name) === -1 ? this._files.push(suite.name) : null);
  }
};

function extractOnly(suite) {
  if (suite.hasOnly) {
    const childrenWithOnly = suite.children.filter(child => child.only);
    const childrenHasOnly = suite.children.filter(extractOnly);
    suite.children = childrenHasOnly.concat(childrenWithOnly);
    return true;
  } else {
    return false;
  }
}
