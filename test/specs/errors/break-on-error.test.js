'use strict';

describe('config.breakOnError', () => {

  beforeEach(context => {
    context.options.include = ['TEST_END', 'HOOK_END'];
    context.options.config = {
      breakOnError: true,
    };
  });

  it('should break for test', run => {
    const output = run(`
      describe('suite 1', () => {
        it('test 0', () => { throw new Error('err') });
        it('test 1', noop);
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0 err',
    ]);
  });

  it('should call all `after` and `afterEach` hooks for test error', run => {
    const output = run(`
      describe('suite 1', () => {
        after(noop);
        afterEach(noop);
        it('test 0', () => { throw new Error('err') });
        it('test 1', noop);
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0 err',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 after'
    ]);
  });

  it('should call all `after` hooks for before error', run => {
    const output = run(`
      describe('suite 1', () => {
        before(() => { throw new Error('err') });
        after(noop);
        afterEach(noop);
        it('test 0', noop);
        it('test 1', noop);
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 before err',
      'HOOK_END suite 1 after'
    ]);
  });

  $if(isSyncTarget);
  it('should terminate all sessions in case of test error', run => {
    const config = {
      concurrency: 2,
    };
    const output = run([`
        describe('suite 1', () => {
          it('test 1', () => sleepError(10, 'err'));
        });
      `, `
        describe('suite 2', () => {
          it('test 2', () => sleep(100));
        });
      `], {config, include: ['SESSION', 'TEST'], output: 'treeReport'});

    return expectResolve(output, {
      target1: {
        session0: [
          'SESSION_START 0',
          'TEST_START test 1',
          'TEST_END test 1 err',
          'SESSION_END 0'
        ],
        session1: [
          'SESSION_START 1',
          'TEST_START test 2',
          'SESSION_END 1'
        ]
      }
    });
  });

});
