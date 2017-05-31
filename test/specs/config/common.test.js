'use strict';

describe('config common', () => {

  it('should fail for unknown option', run => {
    const config = {
      abc: 1,
    };
    const result = run(`
      it('test 0', noop);
    `, {config});

    return expectReject(result, 'Unknown config option: abc');
  });

  it('should fail for incorrect option type', run => {
    const config = {
      createTargets: 1,
    };
    const result = run(`
      it('test 0', noop);
    `, {config});

    return expectReject(result, 'Incorrect config option type for: createTargets (expected function, got number)');
  });

});
