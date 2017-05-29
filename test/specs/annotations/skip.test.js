describe('annotation: skip', () => {

  it('should skip test', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        $skip();
        it('test 1', noop);
        it('test 2', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0',
      'TEST_END test 2',
    ]);
  });

  it('should skip suite', run => {
    const result = run(`
      $skip();
      describe('suite 1', () => {
        it('test 2', noop);
        it('test 3', noop);
      });
      describe('suite 4', () => {
        it('test 4', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 4',
    ]);
  });

  it('should apply nested skips', run => {
    const result = run(`
      $skip();
      describe('suite 1', () => {
        $skip();
        it('test 2', noop);
        it('test 3', noop);
      });
      describe('suite 4', () => {
        it('test 4', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 4',
    ]);
  });

  it('should apply several skips', run => {
    const result = run(`
      describe('suite 1', () => {
        $skip();
        it('test 2', noop);
        it('test 3', noop);
        $skip();
        describe('suite 4', () => {
          it('test 4', noop);
        });
        describe('suite 5', () => {
          it('test 5', noop);
        });
      });
    `);

    return expectResolve(result, [
      'TEST_END test 5',
      'TEST_END test 3',
    ]);
  });

  it('should have skipped items summary in result', run => {
    const assertions = {
      'length': 1,
      '0.data.result.skip.files.size': 2,
      '0.data.result.skip.suites.size': 1,
      '0.data.result.skip.tests.size': 1,
    };
    const result = run([`
      $skip();
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `, `
      describe('suite 2', () => {
        $skip();
        it('test 2', noop);
      });
    `, `
      it('test 3', noop)
    `], {include: ['RUNNER_START'], rawEvents: Object.keys(assertions)});

    return expectResolve(result)
      .then(res => expect(res, 'to equal', assertions));
  });

  it('should skip inside only', run => {
    const result = run(`
      $only();
      describe('suite 1', () => {
        it('test 0', noop);
        $skip();
        it('test 1', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0',
    ]);
  });

  it('should not skip if only applied', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        $only();
        $skip();
        it('test 1', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 1',
    ]);
  });

  it('should skip inside tag', run => {
    const config = {
      tags: ['tag1']
    };
    const result = run(`
      $tags('tag1');
      describe('suite 1', () => {
        it('test 0', noop);
        $skip();
        it('test 1', noop);
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 0',
    ]);
  });

});
