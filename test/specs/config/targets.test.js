describe('config targets', () => {

  beforeEach(context => {
    context.runOptions.include = ['SESSION', 'TEST_END'];
  });

  it('should run tests in all targets', run => {
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
        it('test 1', noop);
      });
    `, {config});

    return expectResolve(report, {
      target1: {
        session0: [
          'SESSION_START 0',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 0'
        ]
      },
      target2: {
        session1: [
          'SESSION_START 1',
          'TEST_END test 0',
          'TEST_END test 1',
          'SESSION_END 1'
        ]
      }
    });
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
    `, {config, flat: true, include: ['TARGET', 'TEST_END']});

    return expectResolve(report, [
      'TARGET_START target1',
      'TEST_END test 0',
      'TARGET_END target1',
      'TARGET_START target2',
      'TEST_END test 0',
      'TARGET_END target2'
    ]);
  });


  it('should fail in case of no targets', run => {
    const config = {
      createTargets: function () {
        return [];
      },
    };
    const report = run(`
        describe('suite', () => {
          it('test 0', noop);
        });
      `, {config});

    return expectReject(report, 'You should provide at least one target');
  });

  it('should filter targets by target option', run => {
    const config = {
      target: 'target1',
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
      'SESSION_START 0',
      'TEST_END test 0',
      'SESSION_END 0'
    ]);
  });

});
