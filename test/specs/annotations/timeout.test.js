$if(env => env.id === 'sync-env');
describe('annotation: timeout', () => {

  it('should fail after test timeout', run => {
    const result = run(`
      describe('suite 1', () => {
        $timeout(10);
        it('test 0', () => sleep(20));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 10 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after suite timeout', run => {
    const result = run(`
      $timeout(10);
      describe('suite 1', () => {
        it('test 0', () => sleep(20));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 10 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after global timeout', run => {
    const config = {
      timeout: 10
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', () => sleep(20));
        it('test 1', () => sleep(1));
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 0 Timeout 10 ms exceeded',
      'TEST_END test 1'
    ]);
  });

});
