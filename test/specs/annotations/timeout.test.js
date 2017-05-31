'use strict';

$if(target => target.id === 'sync-target');
describe('annotation: timeout', () => {

  it('should fail after test timeout', run => {
    const output = run(`
      describe('suite 1', () => {
        $timeout(20);
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after suite timeout', run => {
    const output = run(`
      $timeout(20);
      describe('suite 1', () => {
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `);

    return expectResolve(output, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

  it('should fail after global timeout', run => {
    const config = {
      timeout: 20
    };
    const output = run(`
      describe('suite 1', () => {
        it('test 0', () => sleep(30));
        it('test 1', () => sleep(1));
      });
    `, {config});

    return expectResolve(output, [
      'TEST_END test 0 Timeout 20 ms exceeded',
      'TEST_END test 1'
    ]);
  });

});
