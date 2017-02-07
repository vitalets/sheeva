describe('config startSession / endSession hooks', () => {

  beforeEach(context => {
    context.runOptions.include = ['SESSION'];
  });

  describe('success cases', () => {

    it('should call startSession / endSession for single session (concurrency = 1)', run => {
      let a = 0;
      let b = 0;
      const config = {
        startSession: () => a++,
        endSession: () => b++,
      };
      const result = run(`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });
      `, {config});

      return expectResolve(result, [
        'SESSION_START 0',
        'SESSION_END 0',
      ]).then(() => {
        expect(a, 'to equal', 1);
        expect(b, 'to equal', 1);
      })
    });

    it('should call startSession / endSession for several sessions (concurrency = 2)', run => {
      let a = 0;
      let b = 0;
      const config = {
        concurrency: 2,
        startSession: () => a++,
        endSession: () => b++,
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
        env1: {
          session0: [
            'SESSION_START 0',
            'SESSION_END 0',
          ],
          session1: [
            'SESSION_START 1',
            'SESSION_END 1'
          ]
        }
      }).then(() => {
        expect(a, 'to equal', 2);
        expect(b, 'to equal', 2);
      })
    });

    it('should call startSession / endSession for several sessions (splitFiles = true)', run => {
      let a = 0;
      let b = 0;
      const config = {
        concurrency: 2,
        splitFiles: true,
        startSession: () => a++,
        endSession: () => b++,
      };
      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
          it('test 1', noop);
        });
      `], {config});

      return expectResolve(result, {
        env1: {
          session0: [
            'SESSION_START 0',
            'SESSION_END 0',
          ],
          session1: [
            'SESSION_START 1',
            'SESSION_END 1'
          ]
        }
      }).then(() => {
        expect(a, 'to equal', 2);
        expect(b, 'to equal', 2);
      })
    });

  });

  describe('error cases', () => {

    it('should call endSession in case of error in startSession', run => {
      let b = 0;
      const config = {
        startSession: () => {
          throw new Error('err')
        },
        endSession: () => b++,
      };
      const result = run(`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, {config});

      return expectReject(result, {
        message: 'err',
        report: [
          'SESSION_START 0',
          'SESSION_END 0'
        ]
      })
        .then(() => expect(b, 'to equal', 1));
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
     env1: {
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
     env1: {
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
    it('should not call endSession if startSession was not called (error in create envs)', run => {
      let a = 0;
      let b = 0;
      const config = {
        startSession: () => a++,
        endSession: () => b++,
        createEnvs: () => {
          throw new Error('err')
        }
      };
      const result = run(`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `, {config, include: ['SESSION']});

      return expectReject(result, {
        message: 'err'
      })
        .then(() => {
          expect(a, 'to equal', 0);
          expect(b, 'to equal', 0);
        });
    });

  });
});
