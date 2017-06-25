'use strict';

describe('single error in beforeEach', () => {

  beforeEach(context => {
    context.options.include = ['HOOK_END', 'TEST_END', 'SUITE_END'];
  });

  it('should skip suite', run => {
    const output = run(`
      describe('suite 1', () => {
        beforeEach(() => { throw new Error('err') });
        it('test 0', noop);
        it('test 1', noop);
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 beforeEach err',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should skip only errored suite', run => {
    const output = run(`
      describe('suite 1', () => {
        before(noop);
        describe('suite 2', () => {
          beforeEach(() => { throw new Error('err') });
          it('test 0', noop);
        });
        describe('suite 3', () => {
          it('test 1', noop);
        }); 
      });
    `, {include: ['HOOK_END', 'TEST_END', 'SUITE']});

    return expectResolve(output, [
      'SUITE_START root',
      'SUITE_START suite 1',
      'HOOK_END suite 1 before',
      'SUITE_START suite 2',
      'HOOK_END suite 2 beforeEach err',
      'SUITE_END suite 2',
      'SUITE_START suite 3',
      'TEST_END test 1',
      'SUITE_END suite 3',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should call all `after` and `afterEach` hooks', run => {
    const output = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(() => { throw new Error('err') });
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `, {include: ['HOOK_END']});

    return expectResolve(output, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 2 before',
      'HOOK_END suite 1 beforeEach',
      'HOOK_END suite 2 beforeEach err',
      'HOOK_END suite 2 afterEach',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 2 after',
      'HOOK_END suite 1 after'
    ]);
  });

});
