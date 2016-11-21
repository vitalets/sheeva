describe('sort', () => {

  it('should move suite with before/after hooks first', session => {
    const report = runCode(`
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
    `, session, ['TEST_END']);

    return expect(report, 'to be fulfilled with', [
      'TEST_END test 2',
      'TEST_END test 1',
      'TEST_END test 3',
      'TEST_END test 0'
    ])
  });

});
