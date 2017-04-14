/**
 * Fills suites via walking recursively by map of (fn, suites) and calling fn
 */

module.exports = class Walker {
  constructor(currentSuites) {
    this._currentSuites = currentSuites;
  }

  fill(fnSuites) {
    fnSuites.forEach((suites, fn) => {
      this._fillSuites(suites, fn);
      this._fillChildSuites();
    });
  }

  _fillSuites(suites, fn) {
    this._currentSuites.set(suites);
    fn();
  }

  _fillChildSuites() {
    this.fill(this._currentSuites.childFnSuites);
  }
};
