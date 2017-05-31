'use strict';

describe('concurrency', () => {

  it('should run 2 files in parallel sessions', run => {
    const config = {concurrency: 2};
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `,`
      describe('suite 2', () => {
        it('test 2', noop);
      });
      `], {config, output: 'treeReport'});

    return expectResolve(output, {
        target1: {
          session0: ['TEST_END test 1'],
          session1: ['TEST_END test 2']
        }
      }
    );
  });

  it('should run each test in separate session if concurrency = 0', run => {
    const config = {concurrency: 0};
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `,`
      describe('suite 2', () => {
        it('test 2', noop);
      });
      `,`
      describe('suite 3', () => {
        it('test 3', noop);
        it('test 4', noop);
      });
      `], {config, output: 'treeReport'});

    return expectResolve(output, {
      target1: {
        session0: [ 'TEST_END test 1' ],
        session1: [ 'TEST_END test 2' ],
        session2: [ 'TEST_END test 3', 'TEST_END test 4' ]
      }
    });
  });

  it('should correctly send target events (especially TARGET_END)', run => {
    const config = {concurrency: 2};
    const include = ['TARGET', 'TEST_END'];
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `,`
      describe('suite 2', () => {
        it('test 2', noop);
      });
    `], {config, include});

    return expectResolve(output, [
      'TARGET_START target1',
      'TEST_END test 1',
      'TEST_END test 2',
      'TARGET_END target1'
    ]);
  });

});
