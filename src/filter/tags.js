/**
 * Filters by tags
 */

const Includer = require('./includer');

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
      this._includeTagged();
    }
  }

  _includeTagged() {
    this._envData.forEach(data => {
      const taggedItems = this._concatTagItems(data.tags);
      data.fileSuites = new Includer(data.fileSuites).include(taggedItems);
    });
  }

  _concatTagItems(tagsMap) {
    return this._tags.reduce((res, tag) => {
      const items = tagsMap.get(tag) || [];
      return res.concat(items);
    }, []);
  }
};
