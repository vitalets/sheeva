'use strict';

describe('config startWorker / endWorker', () => {

  /**
   * These functions should not depend on any scope variables as they are stringified for web-workers
   */

  function getProcessOutput(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      const {startWorker, endWorker} = context;
      delete context.startWorker;
      delete context.endWorker;
      return {startWorker, endWorker};
    };
  }

  function getStartWorker(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      context.startWorker = context.startWorker ? context.startWorker + 1 : 1;
    };
  }

  function getEndWorker(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      context.endWorker = context.endWorker ? context.endWorker + 1 : 1;
    };
  }

  beforeEach(context => {
    const localContext = {};
    context.options = {
      config: {
        startWorker: getStartWorker(localContext),
        endWorker: getEndWorker(localContext),
      },
      processOutput: getProcessOutput(localContext)
    };
  });

  describe('success cases', () => {

    it('should call startWorker / endWorker for concurrency = 1', run => {
      const output = run(`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 2', noop);
        });
      `);

      return expectResolve(output, {
        startWorker: 1,
        endWorker: 1,
      });
    });

    it('should call startWorker / endWorker for concurrency = 2 (files = 2, splitSuites = false)', run => {
      const config = {
        concurrency: 2,
      };
      const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `, `
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

      return expectResolve(output, {
        startWorker: 2,
        endWorker: 2,
      });
    });

    it('should call startWorker / endWorker for concurrency = 2 (files = 1, splitSuites = true)', run => {
      const config = {
        concurrency: 2,
        splitSuites: true,
      };
      const output = run([`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 1', noop);
        });
      `], {config});

      return expectResolve(output, {
        startWorker: 2,
        endWorker: 2,
      });
    });

  });

  describe('error cases', () => {

    it('should call endWorker in case of error in startWorker', run => {
      const config = {
        startWorker: () => {
          throw new Error('err');
        },
      };
      const output = run(`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, {config, output: 'result'});

      return expectReject(output, {
        message: 'err',
        output: {
          endWorker: 1,
        }
      });
    });

    it('should not call endWorker if startWorker was not called (error in create targets)', run => {
      const config = {
        createTargets: () => {
          throw new Error('err');
        }
      };
      const output = run(`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, {config});

      return expectReject(output, {
        message: 'err',
        output: {
          startWorker: undefined,
          endWorker: undefined,
        }
      });
    });
  });

  $ignore(isWebWorker);
  it('should throw error when setting getter prop of worker', run => {
    const config = {
      startWorker: worker => worker.index = 1,
    };
    const output = run([`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 1', noop);
        });
      `], {config});

    return expectReject(output, 'Cannot set property index of #<Worker> which has only a getter');
  });

});
