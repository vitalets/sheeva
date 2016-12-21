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

    return expectResolve(result).then(() => {
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

    return expectReject(result, {
      message: 'err',
      report: [
        'SESSION_START 1',
        'SESSION_END 1'
      ]
    })
    .then(() => expect(b, 'to equal', 1));
  });

  it('should call all endSessions in case of error in one startSession', run => {
    let a = 0;
    let b = 0;
    const config = {
      concurrency: 2,
      splitSuites: true,
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
        it('test 2', noop);
      });
      `], {config, include: ['SESSION']});

    return expectReject(result, {
      message: 'err',
      report: {
        env1: {
          session1: [
            'SESSION_START 1',
            'SESSION_END 1',
          ],
          session2: [
            'SESSION_START 2',
            'SESSION_END 2'
          ]
        }
      }
    })
    .then(() => expect(b, 'to equal', 2));

  });

});
