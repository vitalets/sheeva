/**
 * Filters by tags
 */

const {config} = require('../../configurator');
const {result} = require('../../result');
const ExtraSet = require('../../utils/extra-set');
const Includer = require('./includer');

module.exports = class Tags {
  /**
   * Constructor
   */
  constructor() {
    this._topSuitesPerEnv = result.topSuitesPerEnv;
    this._annotationsPerEnv = result.annotationsPerEnv;
    this._summary = result.tags;
    this._configTags = config.tags;
  }

  filter() {
    if (this._configTags && this._configTags.length) {
      this._filterTopSuites();
    }
  }

  _filterTopSuites() {
    this._topSuitesPerEnv.forEach((topSuites, env) => {
      const tags = this._annotationsPerEnv.get(env).tags;
      const taggedItems = this._concatTagItems(tags);
      new Includer(topSuites).include(taggedItems);
    });
  }

  _concatTagItems(tags) {
    const taggedItems = new ExtraSet();
    this._configTags.forEach(configTag => {
      const items = tags.get(configTag);
      if (items && items.size) {
        items.forEach(item => taggedItems.add(item));
        this._updateSummary(configTag);
      }
    });
    return taggedItems;
  }

  _updateSummary(configTag) {
    this._summary.intersected.add(configTag);
  }
};
