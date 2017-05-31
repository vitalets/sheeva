'use strict';


describe('context', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END'];
  });

  it('should create test context and pass it to each hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        beforeEach((context, session) => {
          if (!context) {
            throw new Error('test context not created')
          }
          context.be1 = 1;
        });
        
        beforeEach((context, session) => {
          if (!context.be1) {
            throw new Error('beforeEach1 was not called with context')
          }
          context.be2 = 1;
        });
        
        afterEach((context, session) => {
          if (!context.be1 || !context.be2 || !context.test1) {
            throw new Error('beforeEach1 or beforeEach2 or test1 was not called with context')
          }
          context.ae1 = 1;
        });
        
         afterEach((context, session) => {
          if (!context.be1 || !context.be2 || !context.test1 || !context.ae1) {
            throw new Error('beforeEach1 or beforeEach2 or test1 or afterEach1 was not called with context')
          }
        });
        
        it('test 1', (context, session) => {
          if (!context.be1 || !context.be2) {
            throw new Error('beforeEach1 or beforeEach2 was not called with context')
          }
          context.test1 = 1;
        });
        
      });
    `);

    return expectResolve(report, [
      'HOOK_END suite 1 beforeEach',
      'HOOK_END suite 1 beforeEach 1',
      'TEST_END test 1',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 afterEach 1'
    ]);
  });

  it('should not create context for before/after hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        before((context, session) => {
          if (context) {
            throw new Error('suite context not supported in before hook yet')
          }
        });
        
        after((context, session) => {
          if (context) {
            throw new Error('suite context not supported in after hook yet')
          }
        });
        
        it('test 1', noop);
      });
    `);

    return expectResolve(report, [
      'HOOK_END suite 1 before',
      'TEST_END test 1',
      'HOOK_END suite 1 after',
    ]);
  });

});
