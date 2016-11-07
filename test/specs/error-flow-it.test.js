
const path = require('path');

describe('error flow', () => {

  function error() {
    throw new Error('err');
  }

  beforeEach(() => {
    fn.clear();
    const absPath = path.resolve('./test/data/it-hooks.js');
    delete require.cache[absPath];
  });

  it('should run all hooks in case of test error', () => {
    fn.once('test 0', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 0',
      'TEST_END test 0 err',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 1',
      'TEST_END test 1',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root'
    ]);
  });

  it('should skip suite in case of before error', () => {
    fn.once('before 0', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0 err',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of before second error', () => {
    fn.once('before 1', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1 err',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of beforeEach error', () => {
    fn.once('beforeEach 0', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0 err',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip suite in case of beforeEach second error', () => {
    fn.once('beforeEach 1', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1 err',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip rest of tests in case of afterEach error', () => {
    fn.once('afterEach 0', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 0',
      'TEST_END test 0',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0 err',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should skip rest of tests in case of afterEach second error', () => {
    fn.once('afterEach 1', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 0',
      'TEST_END test 0',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1 err',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root err'
    ]);
  });

  it('should run all hooks in case of after error', () => {
    fn.once('after 0', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 0',
      'TEST_END test 0',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 1',
      'TEST_END test 1',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0 err',
      'SUITE_END root err'
    ]);
  });

  it('should run all hooks in case of after second error', () => {
    fn.once('after 1', error);
    const report = run('./test/data/it-hooks.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 0',
      'TEST_END test 0',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 1',
      'TEST_END test 1',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1 err',
      'SUITE_END root err'
    ]);
  });

});
