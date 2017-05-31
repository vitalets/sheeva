'use strict';

describe('single error in afterEach', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END', 'SUITE_END'];
  });

  it('should skip suite', run => {
    const report = run(`
      describe('suite 1', () => {
        afterEach(() => { throw new Error('err') });
        it('test 0', noop);
        it('test 1', noop);
      });
    `);

    return expectResolve(report, [
      'TEST_END test 0',
      'HOOK_END suite 1 afterEach err',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should skip only errored suite', run => {
    const report = run(`
      describe('suite 1', () => {
        describe('suite 2', () => {
          afterEach(() => { throw new Error('err') });
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
      'HOOK_END suite 2 afterEach err',
      'SUITE_END suite 2',
      'TEST_END test 2',
      'SUITE_END suite 3',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should call all `after` and `afterEach` hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        after(noop);
        afterEach(noop);

        describe('suite 2', () => {
          after(noop);
          afterEach(() => { throw new Error('err') });        

          it('test 0', noop);
        });
      });
    `, {include: ['HOOK_END']});

    return expectResolve(report, [
      'HOOK_END suite 2 afterEach err',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 2 after',
      'HOOK_END suite 1 after'
    ]);
  });

});
