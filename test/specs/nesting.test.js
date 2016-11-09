
describe('nesting', () => {

  it('should run it without describe', () => {
    const report = run('./test/data/it.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_END root',
    ])
  });

  $only();
  it('should run it within describe', () => {
    const report = run('./test/data/describe-it.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_END suite',
      'SUITE_END root',
    ])
  });

});

