
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

  it('should not run describe without it', () => {
    const report = run('./test/data/empty-describe.js');
    expect(report, 'to equal', [])
  });

  $only();
  it('should run it within describe', () => {
    return run('./test/data/describe-it.js').then(report => {
        expect(report, 'to equal', [
          'SUITE_START root',
          'SUITE_START suite 1',
          'TEST_END test 0',
          'TEST_END test 1',
          'TEST_END test 4',
          'SUITE_START suite 2',
          'TEST_END test 2',
          'SUITE_END suite 2',
          'SUITE_START suite 3',
          'TEST_END test 3',
          'SUITE_END suite 3',
          'SUITE_END suite 1',
          'SUITE_START suite 4',
          'TEST_END test 5',
          'SUITE_END suite 4',
          'SUITE_END root'
        ])
      })
  });

});

