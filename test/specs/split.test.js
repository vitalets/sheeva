describe('split suites', () => {

  it('should split suites on 2 parallel sessions', run => {
    const config = {concurrency: 2, splitSuites: true};
    const report = run([`
      describe('suite 1', () => {
        before(noop);
        beforeEach(noop);
        afterEach(noop);
        after(noop);
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
      });
      `], {config});

    return expect(report, 'to be fulfilled with', {
        session1: [
          'SESSION_START 1',
          'SUITE_START root',
          'SUITE_START suite 1',
          'HOOK_END suite 1 before 0',
          'HOOK_END suite 1 beforeEach 0',
          'TEST_END test 1',
          'HOOK_END suite 1 afterEach 0',
          'HOOK_END suite 1 beforeEach 0',
          'TEST_END test 2',
          'HOOK_END suite 1 afterEach 0',
          'HOOK_END suite 1 after 0',
          'SUITE_END suite 1',
          'SUITE_END root',
          'SESSION_END 1'
        ],
        session2: [
          'SESSION_START 2',
          'SUITE_START root',
          'SUITE_START suite 1',
          'HOOK_END suite 1 before 0',
          'HOOK_END suite 1 beforeEach 0',
          'TEST_END test 3',
          'HOOK_END suite 1 afterEach 0',
          'HOOK_END suite 1 after 0',
          'SUITE_END suite 1',
          'SUITE_END root',
          'SESSION_END 2'
        ]
      }
    )
  });

});
