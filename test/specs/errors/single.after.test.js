'use strict';

describe('single error in after', () => {

  beforeEach(context => {
    context.options.include = ['HOOK_END', 'TEST_END', 'SUITE_END'];
  });

  it('should not skip suite', run => {
    const output = run(`
      describe('suite 1', () => {
        after(() => { throw new Error('err') });
        it('test 0', noop);
        it('test 1', noop);
      });
    `, {include: ['HOOK_END', 'TEST_END', 'SUITE_END']});

    return expectResolve(output, [
      'TEST_END test 0',
      'TEST_END test 1',
      'HOOK_END suite 1 after err',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should not skip another suite', run => {
    const output = run(`
      describe('suite 1', () => {
        before(noop);
        describe('suite 2', () => {
          after(() => { throw new Error('err') });
          it('test 0', noop);
          it('test 1', noop);
        });
        describe('suite 3', () => {
          it('test 2', noop);
        }); 
      });
    `, {include: ['HOOK_END', 'TEST_END', 'SUITE']});

    return expectResolve(output, [
      'SUITE_START root',
      'SUITE_START suite 1',
      'HOOK_END suite 1 before',
      'SUITE_START suite 2',
      'TEST_END test 0',
      'TEST_END test 1',
      'HOOK_END suite 2 after err',
      'SUITE_END suite 2',
      'SUITE_START suite 3',
      'TEST_END test 2',
      'SUITE_END suite 3',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should call rest of `after` hooks', run => {
    const output = run(`
      describe('suite 1', () => {
        after(noop);

        describe('suite 2', () => {
          after(() => { throw new Error('err') });
          it('test 0', noop);
        });
      });
    `, {include: ['HOOK_END']});

    return expectResolve(output, [
      'HOOK_END suite 2 after err',
      'HOOK_END suite 1 after'
    ]);
  });

});
