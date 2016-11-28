
describe('concurrency', () => {

  it('should run 2 files in parallel sessions', run => {
    const config = {concurrency: 2};
    const report = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `,`
      describe('suite 2', () => {
        it('test 2', noop);
      });
      `], {config});

    return expect(report, 'to be fulfilled with', {
        env1: {
          session1: [
            'SESSION_START 1',
            'SUITE_START root',
            'SUITE_START suite 1',
            'TEST_END test 1',
            'SUITE_END suite 1',
            'SUITE_END root',
            'SESSION_END 1'
          ],
          session2: [
            'SESSION_START 2',
            'SUITE_START root',
            'SUITE_START suite 2',
            'TEST_END test 2',
            'SUITE_END suite 2',
            'SUITE_END root',
            'SESSION_END 2'
          ]
        }
      }
    )
  });

});
