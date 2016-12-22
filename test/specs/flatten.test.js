describe('flatten', () => {

  beforeEach(context => {
    context.include = ['TEST_END'];
  });

  it('should move suite with max before/after hooks first', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);
      });
      
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 1', noop);
        
        describe('suite 3', () => {
           before(noop);
           after(noop);
           it('test 2', noop);
        });
      });
      
      describe('suite 4', () => {
        before(noop);
        it('test 3', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 1',
      'TEST_END test 3',
      'TEST_END test 0'
    ])
  });

});
