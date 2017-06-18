'use strict';

/**
 * Filters by tags
 */

const {config} = require('../../configurator');
const state = require('../../state');
const ExtraSet = require('../../utils/extra-set');
const Includer = require('./includer');

module.exports = class Tags {
  /**
   * Constructor
   */
  constructor() {
    this._topSuitesPerTarget = state.topSuitesPerTarget;
    this._annotationsPerTarget = state.annotationsPerTarget;
    this._summary = state.tags;
    this._configTags = config.tags;
  }

  filter() {
    if (this._configTags && this._configTags.length) {
      this._filterTopSuites();
    }
  }

  _filterTopSuites() {
    this._topSuitesPerTarget.forEach((topSuites, target) => {
      const tags = this._annotationsPerTarget.get(target).tags;
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
