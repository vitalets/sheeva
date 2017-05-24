describe('result', () => {

  beforeEach(context => {
    context.runOptions.result = true;
  });

  it('should return result on success', run => {
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `]);

    return expectResolve(result).then(res => {
      expect(res, 'to have keys', [
        'config',
        'errors',
        'runner',
        'only',
        'skip',
        'tags',
        'topSuitesPerTarget',
        'annotationsPerTarget',
        'flatSuitesPerTarget',
        'executionPerTarget',
        'matchedFiles',
        'sessions',
        'workers',
      ]);
    });
  });

});
