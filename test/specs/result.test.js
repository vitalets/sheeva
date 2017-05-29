describe('result', () => {

  beforeEach(context => {
    context.runOptions.result = true;
  });

  it('should return result on success', run => {
    const processOutput = result => Object.keys(result).sort();
    const result = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `], {processOutput});

    return expectResolve(result, [
      'annotationsPerTarget',
      'config',
      'errors',
      'executionPerTarget',
      'flatSuitesPerTarget',
      'matchedFiles',
      'only',
      'runner',
      'sessions',
      'skip',
      'tags',
      'topSuitesPerTarget',
      'workers'
    ]);
  });

});
