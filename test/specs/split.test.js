'use strict';

describe('split files', () => {

  it('should split suite on 2 parallel sessions (and call needed hooks)', run => {
    const config = {
      concurrency: 2,
      splitSuites: true
    };
    const include = ['SESSION', 'SUITE', 'HOOK_END', 'TEST_END'];
    const output = run([`
      describe('suite 1', () => {
        before(noop);
        beforeEach(noop);
        afterEach(noop);
        after(noop);
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
      });
    `], {config, include, output: 'treeReport'});

    return expectResolve(output, {
        target1: {
          session0: [
            'SESSION_START 0',
            'SUITE_START root',
            'SUITE_START suite 1',
            'HOOK_END suite 1 before',
            'HOOK_END suite 1 beforeEach',
            'TEST_END test 1',
            'HOOK_END suite 1 afterEach',
            'HOOK_END suite 1 beforeEach',
            'TEST_END test 2',
            'HOOK_END suite 1 afterEach',
            'HOOK_END suite 1 after',
            'SUITE_END suite 1',
            'SUITE_END root',
            'SESSION_END 0'
          ],
          session1: [
            'SESSION_START 1',
            'SUITE_START root',
            'SUITE_START suite 1',
            'HOOK_END suite 1 before',
            'HOOK_END suite 1 beforeEach',
            'TEST_END test 3',
            'HOOK_END suite 1 afterEach',
            'HOOK_END suite 1 after',
            'SUITE_END suite 1',
            'SUITE_END root',
            'SESSION_END 1'
          ]
        }
      }
    );
  });

  it('should split suite on 3 parallel sessions', run => {
    const config = {
      concurrency: 3,
      splitSuites: true
    };
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
        it('test 4', noop);
        it('test 5', noop);
        it('test 6', noop);
      });
      `], {config, output: 'treeReport'});

    /*
     Split is not equal, because following steps:
     - picked queue with 6 test(s)
     - splitted 3 of 6 test(s)
     - splitted 1 of 3 test(s)

     Maybe this should be improved in future.
    */
    return expectResolve(output, {
        target1: {
          session0: [
            'TEST_END test 1',
            'TEST_END test 2'
          ],
          session1: [
            'TEST_END test 4',
            'TEST_END test 5',
            'TEST_END test 6',
          ],
          session2: [
            'TEST_END test 3',
          ]
        }
      }
    );
  });

  it('should split normally even if tests count less than concurrency', run => {
    const config = {
      concurrency: 10,
      splitSuites: true
    };
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
        it('test 4', noop);
      });
      `], {config, output: 'treeReport'});

    return expectResolve(output, {
        target1: {
          session0: [
            'TEST_END test 1',
          ],
          session1: [
            'TEST_END test 3',
          ],
          session2: [
            'TEST_END test 2',
          ],
          session3: [
            'TEST_END test 4',
          ]
        }
      }
    );
  });

  it('should emit QUEUE_SPLIT event', run => {
    const assertions = {
      'length': 1,
      '0.data.remainingTestsCount': 3,
      '0.data.splittedQueue.tests.length': 1,
      '0.data.suites.length': 2,
    };
    const config = {
      concurrency: 2,
      splitSuites: true
    };
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
        it('test 3', noop);
      });
    `], {config, include: ['QUEUE_SPLIT'], keys: assertions, output: 'rawReport'});

    return expectResolve(output, assertions);
  });

});
