describe('events', () => {

  describe('suite/test', () => {

    beforeEach(context => {
      context.runOptions.include = ['SUITE', 'TEST'];
    });

    it('should emit for nested suites', run => {
      const result = run(`
        describe('suite 1', () => {
          describe('suite 2', () => {
            it('test 1', noop);
            it('test 2', noop);
          });
        });
      `);

      return expectResolve(result, [
        'SUITE_START root',
        'SUITE_START suite 1',
        'SUITE_START suite 2',
        'TEST_START test 1',
        'TEST_END test 1',
        'TEST_START test 2',
        'TEST_END test 2',
        'SUITE_END suite 2',
        'SUITE_END suite 1',
        'SUITE_END root'
      ])
    });

    it('should emit for tests without suites', run => {
      const result = run(`
        it('test 0', noop);
        it('test 1', noop);
      `);

      return expectResolve(result, [
        'SUITE_START root',
        'TEST_START test 0',
        'TEST_END test 0',
        'TEST_START test 1',
        'TEST_END test 1',
        'SUITE_END root'
      ])
    });

    it('should not emit for empty suites', run => {
      const result = run(`
        describe('suite', () => {
          describe('suite 1', noop);
          describe('suite 2', noop);
        });
        describe('suite 3', noop);
      `);

      return expectResolve(result, []);
    });

  });

  describe('hooks', () => {
    // todo
  });

  describe('session', () => {
    // todo
  });

  describe('runner', () => {

    beforeEach(context => {
      context.runOptions.include = ['RUNNER'];
    });

    it('should emit runner events in normal case', run => {
      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `]);

      return expectResolve(result, [
        'RUNNER_START',
        'RUNNER_END',
      ]);
    });

    it('should emit runner events for empty files', run => {
      const result = run(``);
      return expectResolve(result, [
        'RUNNER_START',
        'RUNNER_END',
      ]);
    });

    it('should emit runner events in case of startRunner error', run => {
      const config = {
        startRunner: () => { throw new Error('err') },
      };

      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `], {config});

      return expectReject(result, {
        message: 'err',
        report: [
          'RUNNER_START',
          'RUNNER_END err',
        ]
      });
    });

  });
});
