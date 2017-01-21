/**
 * BDD API
 */

module.exports = class Bdd {
  setAppender(appender) {
    this._appender = appender;
  }

  getMethods() {
    return Object.assign({},
      this._describe(),
      this._it(),
      this._hooks()
    );
  }

  _describe() {
    const methods = {};
    methods.describe = (name, fn) => this._appender.addChildSuite({name, fn});
    methods.ddescribe = methods.describe.only = (name, fn) => this._appender.addChildSuite({name, fn, only: true});
    methods.xdescribe = methods.describe.skip = (name, fn) => this._appender.addChildSuite({name, fn, skip: true});
    return methods;
  }

  _it() {
    const methods = {};
    methods.it = (name, fn) => this._appender.addChildTest({name, fn});
    methods.iit = methods.it.only = (name, fn) => this._appender.addChildTest({name, fn, only: true});
    methods.xit = methods.it.skip = (name, fn) => this._appender.addChildTest({name, fn, skip: true});
    return methods;
  }

  _hooks() {
    const methods = {};
    methods.before = methods.beforeAll = fn => this._appender.addHook('before', fn);
    methods.beforeEach =                 fn => this._appender.addHook('beforeEach', fn);
    methods.after = methods.afterAll =   fn => this._appender.addHook('after', fn);
    methods.afterEach =                  fn => this._appender.addHook('afterEach', fn);
    return methods;
  }
};
