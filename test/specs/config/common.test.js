'use strict';

describe('config common', () => {

  it('should fail for unknown option', run => {
    const config = {
      abc: 1,
    };
    const output = run(`
      it('test 0', noop);
    `, {config});

    return expectReject(output, 'Unknown config option: abc');
  });

  it('should fail for incorrect option type', run => {
    const config = {
      createTargets: 1,
    };
    const output = run(`
      it('test 0', noop);
    `, {config});

    return expectReject(output, 'Incorrect config option type for: createTargets (expected function, got number)');
  });

  $ignore(isWebWorker);
  it('should use callTestFn for callHookFn if it is not passed', run => {
    const config = {
      callTestFn: () => {},
    };
    const output = run(``, {config, output: 'result'});
    return expectResolve(output)
      .then(r => expect(r.config.callHookFn, 'to equal', config.callTestFn));
  });

});
