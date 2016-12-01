/**
 * Looks for `only` and filter tests
 */

module.exports = class Only {
  constructor() {
    this._found = false;
  }
  get found() {
    return this._found;
  }
  process(envSuites) {
    if (this._detectOnly(envSuites)) {
      this._filter(envSuites);
    }
  }
  _detectOnly(envSuites) {
    for (let suites of envSuites.values()) {
      const hasOnly = suites.some(suite => suite.hasOnly);
      if (hasOnly) {
        this._found = true;
        break;
      }
    }
    return this._found;
  }
  _filter(envSuites) {
    envSuites.forEach((suites, env) => {
      suites = suites.filter(extractOnly);
      envSuites.set(env, suites);
    });
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
