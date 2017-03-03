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

    it('should emit runner events for empty files', run => {
      const result = run(``);
      return expectResolve(result, [
        'RUNNER_INIT',
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
          'RUNNER_INIT',
          'RUNNER_START',
          'RUNNER_END err',
        ]
      });
    });

  });

  describe('env', () => {

    beforeEach(context => {
      context.runOptions.include = ['ENV'];
      context.runOptions.flat = true;
    });

    it('should emit ENV_START / ENV_END', run => {
      const config = {
        createEnvs: function () {
          return [
            {id: 'env1'},
            {id: 'env2'},
          ];
        },
      };
      const report = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

      return expectResolve(report, [
        'ENV_START env1',
        'ENV_END env1',
        'ENV_START env2',
        'ENV_END env2',
      ]);
    });

  });

  describe('slot', () => {
    beforeEach(context => {
      context.runOptions.include = ['SLOT'];
      context.runOptions.config = {concurrency: 2};
      context.runOptions.flat = true;
    });

    it('should emit SLOT events', run => {
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
        'SLOT_ADD 0',
        'SLOT_ADD 1',
        'SLOT_DELETE 0',
        'SLOT_DELETE 1',
      ])
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
      ])
    });

    it('should emit for file suites', run => {
      const result = run(`
        it('test 0', noop);
        it('test 1', noop);
      `);

      return expectResolve(result, [
        'SUITE_START root',
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
      ])
    });

  });

});
