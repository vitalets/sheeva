'use strict';


describe('errors in test', () => {

  beforeEach(context => {
    context.options.include = ['HOOK_END', 'TEST_END'];
  });

  it('should run all hooks in case of test error', run => {
    const output = run(`
      describe('suite 1', () => {
        before(noop);
        after(noop);
        beforeEach(noop);
        afterEach(noop);

        describe('suite 2', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);        

          it('test 0', () => { throw new Error('err') });
        });
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 2 before',
      'HOOK_END suite 1 beforeEach',
      'HOOK_END suite 2 beforeEach',
      'TEST_END test 0 err',
      'HOOK_END suite 2 afterEach',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 2 after',
      'HOOK_END suite 1 after'
    ]);
  });

  it('should run all tests with errors', run => {
    const output = run(`
      describe('suite 1', () => {
        it('test 0', () => { throw new Error('err0') });
        describe('suite 2', () => {
          it('test 1', () => { throw new Error('err1') });
          it('test 2', () => { throw new Error('err2') });
        });
      });
    `);

    return expectResolve(output, [
      'TEST_END test 1 err1',
      'TEST_END test 2 err2',
      'TEST_END test 0 err0'
    ]);
  });

});
