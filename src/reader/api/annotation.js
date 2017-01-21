/**
 * Annotation API
 */

module.exports = class AnnotationAPI {
  setAnnotation(annotation) {
    this._annotation = annotation;
  }

  getMethods() {
    return {
      $only: () => this._annotation.only(),
      $skip: () => this._annotation.skip(),
      $tags: this._annotation.tags.bind(this._annotation),
      $ignore: fn => this._annotation.addIgnore(fn),
      $if: fn => this._annotation.addIf(fn),
    };
  }
};
