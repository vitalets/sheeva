
describe('context', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END'];
  });

  it('should create test context and pass it to each hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        beforeEach((session, context) => {
          if (!context) {
            throw new Error('test context not created')
          }
          context.be1 = 1;
        });
        
        beforeEach((session, context) => {
          if (!context.be1) {
            throw new Error('beforeEach1 was not called with context')
          }
          context.be2 = 1;
        });
        
        afterEach((session, context) => {
          if (!context.be1 || !context.be2 || !context.test1) {
            throw new Error('beforeEach1 or beforeEach2 or test1 was not called with context')
          }
          context.ae1 = 1;
        });
        
         afterEach((session, context) => {
          if (!context.be1 || !context.be2 || !context.test1 || !context.ae1) {
            throw new Error('beforeEach1 or beforeEach2 or test1 or afterEach1 was not called with context')
          }
        });
        
        it('test 1', (session, context) => {
          if (!context.be1 || !context.be2) {
            throw new Error('beforeEach1 or beforeEach2 was not called with context')
          }
          context.test1 = 1;
        });
        
      });
    `);

    return expectResolve(report, [
      'HOOK_END suite 1 beforeEach 0',
      'HOOK_END suite 1 beforeEach 1',
      'TEST_END test 1',
      'HOOK_END suite 1 afterEach 0',
      'HOOK_END suite 1 afterEach 1'
    ])
  });

  it('should not create suite context for before/after hooks', run => {
    const report = run(`
      describe('suite 1', () => {
        before((session, context) => {
          if (context) {
            throw new Error('suite context not supported in before hook yet')
          }
        });
        
        after((session, context) => {
          if (context) {
            throw new Error('suite context not supported in after hook yet')
          }
        });
        
        it('test 1', noop);
      });
    `);

    return expectResolve(report, [
      'HOOK_END suite 1 before 0',
      'TEST_END test 1',
      'HOOK_END suite 1 after 0',
    ])
  });

});
