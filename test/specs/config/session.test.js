
describe('config startSession / endSession hooks', () => {

  /**
   * These functions should not depend on any scope variables as they are stringified for web-workers
   */

  function getProcessOutput(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      const {startSession, endSession} = context;
      delete context.startSession;
      delete context.endSession;
      return {startSession, endSession};
    };
  }

  function getStartSession(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      context.startSession = context.startSession ? context.startSession + 1 : 1;
    };
  }

  function getEndSession(localContext) {
    return function () {
      const context = typeof self !== 'undefined' ? self : localContext;
      context.endSession = context.endSession ? context.endSession + 1 : 1;
    };
  }

  beforeEach(context => {
    const localContext = {};
    context.runOptions = {
      config: {
        startSession: getStartSession(localContext),
        endSession: getEndSession(localContext),
      },
      processOutput: getProcessOutput(localContext)
    };
  });

  describe('success cases', () => {

    it('should call startSession / endSession for single session (concurrency = 1)', run => {
      const result = run(`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 2', noop);
        });
      `);

      return expectResolve(result, {
        startSession: 1,
        endSession: 1,
      });
    });

    it('should call startSession / endSession for several sessions (concurrency = 2)', run => {
      const config = {
        concurrency: 2,
      };
      const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `, `
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

      return expectResolve(result, {
        startSession: 2,
        endSession: 2,
      });
    });

    it('should call startSession / endSession for several sessions (splitSuites = true)', run => {
      const config = {
        concurrency: 2,
        splitSuites: true,
      };
      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 1', noop);
        });
      `], {config});

      return expectResolve(result, {
        startSession: 2,
        endSession: 2,
      });
    });

  });

  describe('error cases', () => {

    it('should call endSession in case of error in startSession', run => {
      const config = {
        startSession: () => {
          throw new Error('err');
        },
      };
      const result = run(`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, {config, result: true});

      return expectReject(result, {
        message: 'err',
        result: {
          endSession: 1,
        }
      });
    });

    it('should not call endSession if startSession was not called (error in create targets)', run => {
      const config = {
        createTargets: () => {
          throw new Error('err');
        }
      };
      const result = run(`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, {config});

      return expectReject(result, {
        message: 'err',
        result: undefined
      });
    });
  });

  it('should throw error when setting getter prop of session', run => {
    'use strict';
    const config = {
      startSession: session => session.worker = 1,
    };
    const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 1', noop);
        });
      `], {config});

    return expectReject(result, 'Cannot set property worker of #<Session> which has only a getter');
  });

  /*
   it('should call startSession / endSession for concurrency = 2', run => {
   let a = 0;
   let b = 0;
   const config = {
   concurrency: 2,
   startSession: () => {
   a++;
   if (a > 0) {
   return Promise.resolve().then(() => { throw new Error('err') });
   }
   },
   endSession: () => b++,
   };
   const result = run([`
   describe('suite 1', () => {
   it('test 1', noop);
   });
   `,
   `
   describe('suite 1', () => {
   it('test 1', noop);
   });
   `], {config});

   return expectReject(result, {
   message: 'err',
   report: {
   target1: {
   session0: [
   'SESSION_START 0',
   'SESSION_END 0',
   ],
   session1: [
   'SESSION_START 1',
   'SESSION_END 1'
   ]
   }
   }
   })
   .then(() => expect(b, 'to equal', 2));
   });

   it('should not call endSession if startSession was not called (error in first startSession)', run => {
   let a = 0;
   let b = 0;
   const config = {
   concurrency: 2,
   startSession: () => {
   return a++ === 1
   ? Promise.resolve().then(() => { throw new Error('err') })
   : null;
   },
   endSession: () => b++,
   };
   const result = run([`
   describe('suite 1', () => {
   it('test 1', noop);
   it('test 2', noop);
   });
   `], {config});

   return expectReject(result, {
   message: 'err',
   report: {
   target1: {
   session0: [
   'SESSION_START 0',
   'SESSION_END 0',
   ],
   session1: [
   'SESSION_START 1',
   'SESSION_END 1'
   ]
   }
   }
   })
   .then(() => {
   expect(a, 'to equal', 1);
   expect(b, 'to equal', 2);
   });
   });
   */


});
