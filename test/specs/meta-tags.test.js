describe('meta tags', () => {

  it('should run tagged test', run => {
    const config = {
      tags: ['tag1']
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);

        $tags('tag1');
        it('test 1', noop);
        
        $tags('tag2');
        it('test 2', noop);
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 1',
    ]);
  });

  it('should run tagged suite', run => {
    const config = {
      tags: ['tag1']
    };
    const result = run(`
      describe('suite 0', () => {
        it('test 0', noop);
      });
      
      $tags('tag1');   
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });
    
      $tags('tag2');   
      describe('suite 2', () => {
        it('test 3', noop);
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 1',
      'TEST_END test 2',
    ]);
  });

  it('should combine tags', run => {
    const config = {
      tags: ['tag1', 'tag2']
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);

        $tags('tag1');
        it('test 1', noop);
        
        $tags('tag2');
        it('test 2', noop);
        
        $tags('tag3');
        it('test 3', noop);
        
        $tags('tag1', 'tag2');
        it('test 4', noop);
        
        $tags('tag1', 'tag3');
        it('test 5', noop);
        
        $tags('tag2', 'tag3');
        it('test 6', noop);
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 1',
      'TEST_END test 2',
      'TEST_END test 4',
      'TEST_END test 5',
      'TEST_END test 6',
    ]);
  });

});
