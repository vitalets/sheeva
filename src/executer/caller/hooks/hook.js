/**
 * Calls hook fn
 */

const {config} = require('../../../configurator');
const reporter = require('../../../reporter');
const {HOOK_START, HOOK_END} = require('../../../events');
const FnCaller = require('../fn');

module.exports = class HookCaller {
  /**
   * Constructor
   *
   * @param {Session} session
   * @param {Object} context
   * @param {Hook} hook
   */
  constructor(session, context, hook) {
    this._session = session;
    this._context = context;
    this._hook = hook;
    this._error = null;
    this._timeout = this._hook.timeout || config.timeout;
  }

  call() {
    this._emit(HOOK_START);
    return this._callFn()
      .catch(e => this._storeErrorAndReject(e))
      .finally(() => this._emit(HOOK_END));
  }

  _callFn() {
    const params = {
      session: this._session,
      env: this._session.env,
      fn: this._hook.fn,
      hook: this._hook,
      suite: this._hook.parent,
      context: this._context,
    };
    return new FnCaller({timeout: this._timeout}).call(params);
  }

  _storeErrorAndReject(error) {
    this._error = error;
    return Promise.reject(error);
  }

  _emit(event) {
    const data = {
      session: this._session,
      env: this._session.env,
      hook: this._hook,
      suite: this._hook.parent,
      error: this._error,
    };
    reporter.handleEvent(event, data);
  }
};
