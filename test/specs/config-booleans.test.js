describe('config booleans', () => {

  it('newSessionPerFile', run => {
    const config = {
      newSessionPerFile: true,
    };
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `, `
      describe('suite 2', () => {
        before(noop);
        after(noop);
        it('test 2', noop);
      });     
    `, `
      describe('suite 3', () => {
        before(noop);
        it('test 3', noop);
      });
    `], {config});

    return expectResolve(result, {
      env1: {
        session0: ['TEST_END test 2'],
        session1: ['TEST_END test 3'],
        session2: ['TEST_END test 1']
      }
    })
  });

});
