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

      return expectResolve(result, [
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

      return expectReject(result, {
        message: 'err',
        report: [
          'RUNNER_START',
          'RUNNER_END err',
        ]
      });
    });

  });
});
