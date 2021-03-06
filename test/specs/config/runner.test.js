'use strict';


describe('config runner', () => {

  /**
   * These functions should not depend on any scope variables as they are stringified for web-workers
   */

  function getProcessOutput(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      const {startRunner, endRunner} = context;
      delete context.startRunner;
      delete context.endRunner;
      return {startRunner, endRunner};
    };
  }

  function getStartRunner(localContext) {
    return function () {
      return Promise.resolve().then(() => {
        const context = typeof self !== 'undefined' ? self : localContext;
        context.startRunner = context.startRunner ? context.startRunner + 1 : 1;
      });
    };
  }

  function getEndRunner(localContext) {
    return function () {
      return Promise.resolve().then(() => {
        const context = typeof self !== 'undefined' ? self : localContext;
        context.endRunner = context.endRunner ? context.endRunner + 1 : 1;
      });
    };
  }

  beforeEach(context => {
    const localContext = {};
    context.options = {
      config: {
        startRunner: getStartRunner(localContext),
        endRunner: getEndRunner(localContext),
      },
      processOutput: getProcessOutput(localContext)
    };
  });

  it('should call once startRunner / endRunner in success test', run => {
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `]);

    return expectResolve(output, {
      startRunner: 1,
      endRunner: 1,
    });
  });

  it('should call once startRunner / endRunner in failed test', run => {
    const output = run([`
      describe('suite 1', () => {
        it('test 1', () => { throw new Error('err') });
      });
    `]);

    return expectResolve(output, {
      startRunner: 1,
      endRunner: 1,
    });
  });

  it('should not call startRunner, but call endRunner in case of error in createTargets', run => {
    const config = {
      createTargets: () => { throw new Error('err'); }
    };
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config, output: 'result'});

    return expectReject(output, {
      message: 'err',
      output: {
        endRunner: 1,
      }
    });
  });

  it('should call endRunner even if startRunner has error', run => {
    const config = {
      startRunner: () => Promise.resolve().then(() => { throw new Error('err'); }),
    };
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config, output: 'result'});

    return expectReject(output, {
      message: 'err',
      output: {
        endRunner: 1,
      }
    });
  });

});
