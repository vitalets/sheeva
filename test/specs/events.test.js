describe('events', () => {

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
        'RUNNER_INIT',
        'RUNNER_START',
        'RUNNER_END',
      ]);
    });

    it('should emit runner events for empty file', run => {
      const result = run(``);
      return expectResolve(result, [
        'RUNNER_INIT',
        'RUNNER_START',
        'RUNNER_END',
      ]);
    });

    it('should emit runner events in case of startRunner error', run => {
      const config = {
        startRunner: () => { throw new Error('err'); },
      };

      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `], {config});

      return expectReject(result, {
        message: 'err',
        report: [
          'RUNNER_INIT',
          'RUNNER_START',
          'RUNNER_END err',
        ]
      });
    });

  });

  describe('target', () => {

    beforeEach(context => {
      context.runOptions.include = ['TARGET', 'TEST_END'];
      context.runOptions.flat = true;
    });

    it('should emit target events correctly', run => {
      const config = {
        createTargets: function () {
          return [
            {id: 'target1'},
            {id: 'target2'},
          ];
        },
      };
      const report = run(`
      describe('suite', () => {
        it('test 0', noop);
      });
    `, {config});

      return expectResolve(report, [
        'TARGET_START target1',
        'TEST_END test 0',
        'TARGET_END target1',
        'TARGET_START target2',
        'TEST_END test 0',
        'TARGET_END target2'
      ]);
    });

  });

  describe('worker', () => {
    beforeEach(context => {
      context.runOptions.include = ['WORKER'];
      context.runOptions.config = {concurrency: 2};
      context.runOptions.flat = true;
    });

    it('should emit WORKER events', run => {
      const result = run([`
        describe('suite 1', () => {
          it('test 1', noop);
        });
      `, `
        describe('suite 2', () => {
          it('test 2', noop);
        });
      `]);

      return expectResolve(result, [
        'WORKER_ADD 0',
        'WORKER_ADD 1',
        'WORKER_DELETE 0',
        'WORKER_DELETE 1',
      ]);
    });
  });

  describe('session', () => {
    // todo
  });

  describe('suite', () => {

    beforeEach(context => {
      context.runOptions.include = ['SUITE'];
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
        'SUITE_END suite 2',
        'SUITE_END suite 1',
        'SUITE_END root'
      ]);
    });

    it('should emit for file suites', run => {
      const result = run(`
        it('test 0', noop);
        it('test 1', noop);
      `);

      return expectResolve(result, [
        'SUITE_START root',
        'SUITE_END root'
      ]);
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

  describe('test', () => {
    beforeEach(context => {
      context.runOptions.include = ['TEST'];
    });

    it('should emit TEST_START / TEST_END', run => {
      const result = run(`
        describe('suite 1', () => {
          it('test 1', noop);
          describe('suite 2', () => {
            it('test 2', noop);
            it('test 3', noop);
          });
        });
        it('test 4', noop);
      `);

      return expectResolve(result, [
        'TEST_START test 2',
        'TEST_END test 2',
        'TEST_START test 3',
        'TEST_END test 3',
        'TEST_START test 1',
        'TEST_END test 1',
        'TEST_START test 4',
        'TEST_END test 4'
      ]);
    });

  });

});
