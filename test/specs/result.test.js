'use strict';

describe('result', () => {

  beforeEach(context => {
    context.options.output = 'result';
  });

  it('should return result on success', run => {
    const processOutput = result => Object.keys(result).sort();
    const output = run([`
      describe('suite 1', () => {
        it('test 1', noop);
      });
    `], {processOutput});

    return expectResolve(output, [
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
