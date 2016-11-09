describe('skip', () => {
  $only();
  it('should skip single test by $skip without fn', () => {
    const report = run('./test/data/skip-it.js');
    expect(report, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite 1',
      'SUITE_START suite 2',
      'TEST_END test 1',
      'SUITE_END suite 2',
      'SUITE_END suite 1',
      'SUITE_END root'
    ]);
  });

});
