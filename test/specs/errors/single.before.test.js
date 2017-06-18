'use strict';

describe('single error in before', () => {

  beforeEach(context => {
    context.options.include = ['HOOK_END', 'TEST_END', 'SUITE_END'];
  });

  it('should skip suite', run => {
    const output = run(`
      describe('suite 1', () => {
        before(() => { throw new Error('err') });
        it('test 0', noop);
        it('test 1', noop);
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 1 before err',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should skip only errored suite', run => {
    const output = run(`
      describe('suite 1', () => {
        describe('suite 2', () => {
          before(() => { throw new Error('err') });
          it('test 0', noop);
        });
        describe('suite 3', () => {
          it('test 1', noop);
        }); 
      });
    `);

    return expectResolve(output, [
      'HOOK_END suite 2 before err',
      'SUITE_END suite 2',
      'TEST_END test 1',
      'SUITE_END suite 3',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

  it('should call all `after` hooks', run => {
    const output = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(() => { throw new Error('err') });
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `, {include: ['HOOK_END']});

    return expectResolve(output, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 2 before err',
      'HOOK_END suite 2 after',
      'HOOK_END suite 1 after'
    ]);
  });

});
