/**
 * Calls hook fn (emits HOOK_START and HOOK_END)
 */

const {config} = require('../../../config');
const reporter = require('../../../reporter');
const {HOOK_START, HOOK_END} = require('../../../events');
const Fn = require('../shared/fn');

const HookFn = module.exports = class HookFn {
  /**
   * Constructor
   *
   * @param {Session} session
   * @param {Object} context
   */
  constructor(session, context) {
    this._session = session;
    this._context = context;
    this._hook = null;
    this._timeout = null;
  }

  get session() {
    return this._session;
  }

  call(hook) {
    this._hook = hook;
    this._timeout = this._hook.timeout || config.timeout;
    this._emit(HOOK_START);
    return this._callFn()
      .then(() => this._emit(HOOK_END), e => this._handleError(e));
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
    return new Fn({timeout: this._timeout}).call(params);
  }

  _handleError(error) {
    Object.defineProperty(error, 'suite', {value: this._hook.parent});
    this._emit(HOOK_END, {error});
    return Promise.reject(error);
  }

  _emit(event, data) {
    data = Object.assign({
      session: this._session,
      env: this._session.env,
      hook: this._hook,
      suite: this._hook.parent,
    }, data);
    reporter.handleEvent(event, data);
  }
};

HookFn.isHookError = function (error) {
  return error && Boolean(error.suite);
};

HookFn.extractSuiteFromError = function (error) {
  return error && error.suite;
};
