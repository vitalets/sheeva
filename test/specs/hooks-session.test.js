describe('hooks session', () => {

  it('should call startSession / endSession in normal case', run => {
    let a = 0;
    let b = 0;
    const config = {
      startSession: () => a++,
      endSession: () => b++,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return result.then(() => {
      expect(a, 'to equal', 1);
      expect(b, 'to equal', 1);
    })
  });

  it('should call endSession in case of error in startSession', run => {
    let b = 0;
    const config = {
      startSession: () => { throw new Error('err') },
      endSession: () => b++,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

    return result.catch(e => {
      expect(b, 'to equal', 1);
      expect(e.message, 'to equal', 'err');
      expect(e.report, 'to equal', [
        'SESSION_START 1',
        'SESSION_END 1'
      ]);
    })
  });

  it('should call all endSessions in case of error in one startSession', run => {
    let a = 0;
    let b = 0;
    const config = {
      concurrency: 2,
      splitSuites: true,
      startSession: () => {
        if (a++ > 0) {
          return Promise.resolve().then(() => { throw new Error('err') });
        }
      },
      endSession: () => b++,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });
      `], {config});

    return result.then(
      () => expect(result, 'to be rejected'),
      e => {
        expect(e.message, 'to equal', 'err');
        expect(b, 'to equal', 2);
        expect(e.report, 'to equal', {
          env1: {
            session1: [
              'SESSION_START 1',
              'SUITE_START root',
              'SUITE_START suite 1',
              'SESSION_END 1',
              'TEST_START test 1',
            ],
            session2: [
              'SESSION_START 2',
              'SESSION_END 2'
            ]
          }
        });
      }
    );
  });

});
