'use strict';

describe('single error in after', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END', 'SUITE_END'];
  });

  it('should not skip suite', run => {
    const report = run(`
      describe('suite 1', () => {
        after(() => { throw new Error('err') });
        it('test 0', noop);
        it('test 1', noop);
      });
    `);

    return expectResolve(report, [
      'TEST_END test 0',
      'TEST_END test 1',
      'HOOK_END suite 1 after err',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should not skip another suite', run => {
    const report = run(`
      describe('suite 1', () => {
        describe('suite 2', () => {
          after(() => { throw new Error('err') });
          it('test 0', noop);
          it('test 1', noop);
        });
        describe('suite 3', () => {
          it('test 2', noop);
        }); 
      });
    `);

    return expectResolve(report, [
      'TEST_END test 0',
      'TEST_END test 1',
      'HOOK_END suite 2 after err',
      'SUITE_END suite 2',
      'TEST_END test 2',
      'SUITE_END suite 3',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should call rest of `after` hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        after(noop);

        describe('suite 2', () => {
          after(() => { throw new Error('err') });
          it('test 0', noop);
        });
      });
    `, {include: ['HOOK_END']});

    return expectResolve(report, [
      'HOOK_END suite 2 after err',
      'HOOK_END suite 1 after'
    ]);
  });

});
