/**
 * Annotation API
 */

module.exports = class AnnotationAPI {
  setAnnotator(annotator) {
    this._annotator = annotator;
  }

  getMethods() {
    return {
      $only: () => this._annotator.addOnly(),
      $skip: () => this._annotator.addSkip(),
      $tags: this._addTags.bind(this),
      $ignore: fn => this._annotator.addIgnore(fn),
      $if: fn => this._annotator.addIf(fn),
    };
  }

  _addTags() {
    const tags = [].slice.call(arguments);
    this._annotator.addTags(tags);
  }
};
