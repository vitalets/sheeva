
describe('nesting', () => {

  it('should run it outside describe', env => {
    const report = run('./test/data/it.js', env);
    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_END root',
    ])
  });

  it('should not run describe without it', env => {
    const report = run('./test/data/empty-describe.js', env);
    return expect(report, 'to be fulfilled with', []);
  });

  // todo:
  // it('should process empty files', () => {
  // });

  it('should run it inside describe', env => {
    const report = run('./test/data/describe-it.js', env);
    return expect(report, 'to be fulfilled with', [
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
  });

});

