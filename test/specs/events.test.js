describe('events', () => {

  describe('runner', () => {

    beforeEach(context => {
      context.include = ['RUNNER'];
    });

    it('should emit RUNNER_START / RUNNER_END in normal case', run => {
      const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `]);

      return expect(result, 'to be fulfilled with', [
        'RUNNER_START',
        'RUNNER_END',
      ]);
    });

    it('should emit RUNNER_START / RUNNER_END in case of startRunner error', run => {
      const config = {
        startRunner: () => { throw new Error('err') },
      };

      const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
      `], {config});

      return result.catch(e => {
        expect(e.message, 'to equal', 'err');
        expect(e.report, 'to equal', [
          'RUNNER_START',
          'RUNNER_END err',
        ]);
      });
    });

  });
});
