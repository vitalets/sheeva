$if(env => env.id === 'sync-env');
describe('annotation: timeout', () => {

  it('should fail after test timeout', run => {
    const result = run(`
      describe('suite 1', () => {
        $timeout(5);
        it('test 0', () => sleep(10));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 5 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after suite timeout', run => {
    const result = run(`
      $timeout(5);
      describe('suite 1', () => {
        it('test 0', () => sleep(10));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 5 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after global timeout', run => {
    const config = {
      timeout: 5
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', () => sleep(10));
        it('test 1', () => sleep(1));
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 0 Timeout 5 ms exceeded',
      'TEST_END test 1'
    ]);
  });

});
