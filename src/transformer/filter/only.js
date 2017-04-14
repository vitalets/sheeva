/**
 * Filters tests by `only` annotation
 */

const {config} = require('../../config');
const {result} = require('../../result');
const Includer = require('./includer');

module.exports = class Only {
  constructor() {
    this._topSuitesPerEnv = result.topSuitesPerEnv;
    this._annotationsPerEnv = result.annotationsPerEnv;
    this._summary = result.only;
    this._found = this._hasOnly();
  }

  get found() {
    return this._found;
  }

  filter() {
    this._filterTopSuites();
    // make this check after collecting files to have nicer error message
    if (config.noOnly) {
      this._throwNoOnlyError();
    }
  }

  _hasOnly() {
    for (let data of this._annotationsPerEnv.values()) {
      if (data.only.size > 0) {
        return true;
      }
    }
    return false;
  }

  _filterTopSuites() {
    this._topSuitesPerEnv.forEach((topSuites, env) => {
      const onlyItems = this._annotationsPerEnv.get(env).only;
      new Includer(topSuites).include(onlyItems);
      this._updateSummary(topSuites);
    });
  }

  _updateSummary(topSuites) {
    topSuites.forEach(suite => this._summary.files.add(suite.name));
  }

  _throwNoOnlyError() {
    const files = this._summary.files.toArray();
    throw new Error(
      `ONLY is disallowed but found in ${files.length} file(s):\n ${files.join('\n')}`
    );
  }
};
