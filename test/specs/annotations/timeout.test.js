$if(env => env.id === 'sync-env');
describe('annotation: timeout', () => {

  it('should fail after test timeout', run => {
    const result = run(`
      describe('suite 1', () => {
        $timeout(20);
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after suite timeout', run => {
    const result = run(`
      $timeout(20);
      describe('suite 1', () => {
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(result, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after global timeout', run => {
    const config = {
      timeout: 20
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `, {config});

    return expectResolve(result, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

});
