
describe('hooks success', () => {

  it('should run it and all hooks without describe', () => {
    const report = run('./test/data/hooks-it.js');
    expect(report, 'to equal', [
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
      'HOOK_END root after 1',
      'SUITE_END root',
    ]);
  });

  it('should run it and all hooks within describe', () => {
    const report = run('./test/data/hooks-describe-it.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'SUITE_START suite',
      'HOOK_END suite before 0',
      'HOOK_END root beforeEach 0',
      'HOOK_END suite beforeEach 0',
      'TEST_END test 0',
      'HOOK_END suite afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_END suite beforeEach 0',
      'TEST_END test 1',
      'HOOK_END suite afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_END suite after 0',
      'SUITE_END suite',
      'HOOK_END root after 0',
      'SUITE_END root',
    ]);
  });

});
