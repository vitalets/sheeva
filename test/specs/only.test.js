describe('only', () => {

  it('should run only test by $only()', () => {
    const report = run('./test/data/only-it.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_END test 0',
      'SUITE_END suite',
      'SUITE_END root',
    ]);
  });

  it('should run only describe by $only()', () => {
    const report = run('./test/data/only-describe.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_END suite',
      'SUITE_END root',
    ]);
  });

  it('should run all only describe and it', () => {
    const report = run('./test/data/only-several.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_END test 0',
      'SUITE_END suite',
      'SUITE_START suite 2',
      'TEST_END test 3',
      'SUITE_END suite 2',
      'SUITE_START suite 3',
      'SUITE_START suite 4',
      'TEST_END test 4',
      'SUITE_END suite 4',
      'SUITE_END suite 3',
      'SUITE_END root'
    ]);
  });

});
