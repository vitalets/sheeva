describe('flatten and sort', () => {

  it('should flatten suites on same level and sort by before/after hooks count', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });      
      describe('suite 3', () => {
        before(noop);
        it('test 3', noop);
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 3',
      'TEST_END test 1',
    ])
  });

  it('should flatten and sort suites inside parent suite', run => {
    const result = run(`
      describe('parent suite', () => {
        describe('suite 1', () => {
          it('test 1', noop);
        });
        describe('suite 2', () => {
          before(noop);
          after(noop);
          it('test 2', noop);
        });      
        describe('suite 3', () => {
          before(noop);
          it('test 3', noop);
        });
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 3',
      'TEST_END test 1',
    ])
  });

  it('should flatten suites and sort by nested before/after hooks count', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });      
      describe('suite 3', () => {
        before(noop);
        describe('suite 4', () => {
          before(noop);
          after(noop);
          it('test 3', noop);
        }); 
      });
    `);

    return expectResolve(result, [
      'TEST_END test 3',
      'TEST_END test 2',
      'TEST_END test 1',
    ])
  });

  it('should move tests after suites', run => {
    const result = run(`
      describe('suite 1', () => {
        it('test 1', noop);
        describe('suite 2', () => {
          it('test 2', noop);
        });
      });
    `);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 1',
    ])
  });

  it('should flatten and sort suites between several files', run => {
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `, `
      describe('suite 4', () => {
        it('test 4', noop);
      });
      describe('suite 3', () => {
        before(noop);
        it('test 3', noop);
      });
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });      
    `]);

    return expectResolve(result, [
      'TEST_END test 2',
      'TEST_END test 3',
      'TEST_END test 1',
      'TEST_END test 4',
    ])
  });

});
