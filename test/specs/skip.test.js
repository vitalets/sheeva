describe('skip', () => {

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

  it('should report skipped items in RUNNER_START', run => {
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
    `], {raw: true});

    return expectResolve(result)
      .then(res => {
        const runnerStart = res.find(item => item.event === 'RUNNER_START');
        expect(runnerStart.data.skippedInFiles.length, 'to equal', 2);
        expect(runnerStart.data.skippedSuites.length, 'to equal', 1);
        expect(runnerStart.data.skippedTests.length, 'to equal', 1);
      })
  });


});
