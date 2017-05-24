/**
 * Fills suites via walking recursively by map of (fn, suites) and calling fn
 */

module.exports = class Walker {
  constructor(currentSuites) {
    this._currentSuites = currentSuites;
  }

  fillAsync(fnSuites) {
    let result = Promise.resolve();
    fnSuites.forEach((suites, fn) => {
      result = result
        .then(() => this._fillSuites(suites, fn))
        .then(() => this._fillChildSuites());
    });
    return result;
  }

  fill(fnSuites) {
    fnSuites.forEach((suites, fn) => {
      this._fillSuites(suites, fn);
      this._fillChildSuites();
    });
  }

  _fillSuites(suites, fn) {
    this._currentSuites.set(suites);
    return fn();
  }

  _fillChildSuites() {
    // console.log('_fillChildSuites');
    this.fill(this._currentSuites.childFnSuites);
  }
};
