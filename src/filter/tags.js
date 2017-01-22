/**
 * Filters by tags
 */

const Cleaner = require('./cleaner');

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
      data.roots = new Cleaner(data.roots).keepItems(items);
    });
  }

  _concatTagItems(tagsMap) {
    return this._tags.reduce((res, tag) => {
      const items = tagsMap.get(tag) || [];
      return res.concat(items);
    }, []);
  }
};
