describe('config envs', () => {

  beforeEach(context => {
    context.runOptions.include = ['SESSION', 'TEST_END'];
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
        it('test 1', noop);
      });
    `, {config});

    return expectResolve(report, {
      env1: {
        session0: [
          'SESSION_START 0',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 0'
        ]
      },
      env2: {
        session1: [
          'SESSION_START 1',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 1'
        ]
      }
    });
  });

  it('should emit env events correctly', run => {
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
    `, {config, flat: true, include: ['ENV', 'TEST_END']});

    return expectResolve(report, [
      'ENV_START env1',
      'TEST_END test 0',
      'ENV_END env1',
      'ENV_START env2',
      'TEST_END test 0',
      'ENV_END env2'
    ]);
  });


  it('should fail in case of no envs', run => {
    const config = {
      createEnvs: function () {
        return [];
      },
    };
    const report = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

    return expectReject(report, 'You should provide at least one env');
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

    return expectResolve(report, [
      'SESSION_START 0',
      'TEST_END test 0',
      'SESSION_END 0'
    ]);
  });

});
