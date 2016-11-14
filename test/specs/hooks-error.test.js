
describe('hooks error', () => {

  function error() {
    throw new Error('err');
  }

  it('should run all hooks in case of test error', env => {
    const report = run('./test/data/hooks-it.js', env, {'test 0': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0 err',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 1',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root',
    ]);
  });

  it('should skip suite in case of before error', env => {
    const report = run('./test/data/hooks-it.js', env, {'before 0': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of before second error', env => {
    const report = run('./test/data/hooks-it.js', env, {'before 1': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of beforeEach error', env => {
    const report = run('./test/data/hooks-it.js', env, {'beforeEach 0': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0 err',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of beforeEach second error', env => {
    const report = run('./test/data/hooks-it.js', env, {'beforeEach 1': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1 err',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip rest of tests in case of afterEach error', env => {
    const report = run('./test/data/hooks-it.js', env, {'afterEach 0': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0',
      'HOOK_END root afterEach 0 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip rest of tests in case of afterEach second error', env => {
    const report = run('./test/data/hooks-it.js', env, {'afterEach 1': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should run all hooks in case of after error', env => {
    const report = run('./test/data/hooks-it.js', env, {'after 0': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 1',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0 err',
      'SUITE_END root err'
    ]);
  });

  it('should run all hooks in case of after second error', env => {
    const report = run('./test/data/hooks-it.js', env, {'after 1': error});
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 1',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0',
      'HOOK_END root after 1 err',
      'SUITE_END root err'
    ]);
  });

});
