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

  it('should have skipped items summary in RUNNER_START', run => {
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
    `], {include: ['RUNNER_START'], raw: true});

    return expectResolve(result)
      .then(res => {
        expect(res, 'to have length', 1);
        expect(res[0].data.result.skip.files.size, 'to equal', 2);
        expect(res[0].data.result.skip.suites.size, 'to equal', 1);
        expect(res[0].data.result.skip.tests.size, 'to equal', 1);
      });
  });


});
