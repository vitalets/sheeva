'use strict';

/**
 * Injects and cleanups props from target object
 */

module.exports = class PropsInjector {
  /**
   * Constructor
   */
  constructor() {
    this._props = null;
    this._target = null;
  }

  /**
   * Injects props into target
   *
   * @param {Object} target
   * @param {Object} props
   */
  inject(target, props) {
    this._props = props;
    this._target = target;
    this._forEachProp(prop => this._target[prop] = this._props[prop]);
  }

  /**
   * Cleanups previously injected props
   */
  cleanup() {
    this._forEachProp(prop => delete this._target[prop]);
    this._target = null;
  }

  _forEachProp(iterator) {
    Object.keys(this._props).forEach(iterator);
  }
};
