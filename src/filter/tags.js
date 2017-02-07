/**
 * Filters by tags
 */

const Keeper = require('./keeper');

module.exports = class Tags {
  /**
   * Constructor
   *
   * @param {EnvData} envData
   * @param {Array} tags
   */
  constructor(envData, tags) {
    this._envData = envData;
    this._tags = tags;
  }

  filter() {
    if (this._tags && this._tags.length) {
      this._clean();
    }
  }

  _clean() {
    this._envData.forEach(data => {
      const items = this._concatTagItems(data.tags);
      data.fileSuites = new Keeper(data.fileSuites).keep(items);
    });
  }

  _concatTagItems(tagsMap) {
    return this._tags.reduce((res, tag) => {
      const items = tagsMap.get(tag) || [];
      return res.concat(items);
    }, []);
  }
};
