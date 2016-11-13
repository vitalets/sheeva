
describe('hooks error', () => {

  function error() {
    throw new Error('err');
  }

  //$only();
  it('should run all hooks in case of test error', () => {
    mocks.set('test 0', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should skip suite in case of before error', () => {
    mocks.set('before 0', error);
    const report = run('./test/data/hooks-it.js');
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of before second error', () => {
    mocks.set('before 1', error);
    const report = run('./test/data/hooks-it.js');
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1 err',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of beforeEach error', () => {
    mocks.set('beforeEach 0', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should skip suite in case of beforeEach second error', () => {
    mocks.set('beforeEach 1', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should skip rest of tests in case of afterEach error', () => {
    mocks.set('afterEach 0', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should skip rest of tests in case of afterEach second error', () => {
    mocks.set('afterEach 1', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should run all hooks in case of after error', () => {
    mocks.set('after 0', error);
    const report = run('./test/data/hooks-it.js');
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

  it('should run all hooks in case of after second error', () => {
    mocks.set('after 1', error);
    const report = run('./test/data/hooks-it.js');
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
