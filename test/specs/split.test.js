describe('split suites', () => {

  it('should split suites on 2 parallel sessions with needed hooks', run => {
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
        env1: {
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
      }
    )
  });

  it('should not split suites if disabled in config', run => {
    const config = {concurrency: 2, splitSuites: false};
    const report = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
      });
      `], {config});

    return expect(report, 'to be fulfilled with', [
      'SESSION_START 1',
      'SUITE_START root',
      'SUITE_START suite 1',
      'TEST_END test 1',
      'TEST_END test 2',
      'TEST_END test 3',
      'SUITE_END suite 1',
      'SUITE_END root',
      'SESSION_END 1',
    ])
  });

  it('should split suites on 3 parallel sessions', run => {
    const config = {concurrency: 3, splitSuites: true};
    const include = ['TEST_END'];
    const report = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
        it('test 4', noop);
        it('test 5', noop);
        it('test 6', noop);
      });
      `], {config, include});

    // todo: something goes wrong
    return expect(report, 'to be fulfilled with', {
        env1: {
          session1: [
            'TEST_END test 1',
            'TEST_END test 2'
          ],
          session2: [
            'TEST_END test 4',
            'TEST_END test 5',
            'TEST_END test 6',
          ],
          session3: [
            'TEST_END test 3',
          ]
        }
      }
    )
  });

});
