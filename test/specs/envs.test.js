describe('envs', () => {

  beforeEach(context => {
    context.include = ['SESSION', 'TEST_END'];
  });

  it('should run tests in all envs', run => {
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

    return expect(report, 'to be fulfilled with',  {
        env1: {
          session1: [
            'SESSION_START 1',
            'TEST_END test 0',
            'SESSION_END 1'
          ]
        },
        env2: {
          session2: [
            'SESSION_START 2',
            'TEST_END test 0',
            'SESSION_END 2'
          ]
        }
      }
    );
  });

  it('should fail in case of no envs', run => {
    const config = {
      createEnvs: function () {
        return [ ];
      },
    };
    const report = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

    return expect(report, 'to be rejected with', {
      message: 'You should provide at least one env'
    });
  });

  it('should filter envs by env option', run => {
    const config = {
      env: 'env1',
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

    return expect(report, 'to be fulfilled with value exhaustively satisfying', [
      'SESSION_START 1',
      'TEST_END test 0',
      'SESSION_END 1'
    ]);
  });

});
