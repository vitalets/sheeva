'use strict';

/**
 * Filters tests by `skip` annotation
 */

const state = require('../../state');
const Excluder = require('./excluder');

module.exports = class Skip {
  constructor() {
    this._topSuitesPerTarget = state.topSuitesPerTarget;
    this._annotationsPerTarget = state.annotationsPerTarget;
    this._summary = state.skip;
  }

  filter() {
    this._filterTopSuites();
  }

  _filterTopSuites() {
    this._topSuitesPerTarget.forEach((topSuites, target) => {
      const skippedItems = this._annotationsPerTarget.get(target).skip;
      new Excluder().exclude(skippedItems);
      this._updateSummary(skippedItems);
    });
  }

  _updateSummary(skippedItems) {
    skippedItems.forEach(skippedItem => {
      this._addFile(skippedItem);
      this._addFullname(skippedItem);
    });
  }

  _addFile(skippedItem) {
     const fileName = skippedItem.parents[0].name;
     this._summary.files.add(fileName);
  }

  _addFullname(skippedItem) {
     const fullName = getFullName(skippedItem);
     const target = skippedItem.children ? this._summary.suites : this._summary.tests;
     target.add(fullName);
  }
};

function getFullName(item) {
  return item.parents
    .concat([item.name])
    .map(parent => parent.name)
    .join('');
}
