
describe('nesting', () => {

  beforeEach(context => {
    context.exclude = ['HOOK_START', 'TEST_START'];
  });

  it('should run it outside describe', run => {
    const report = run(`
      it('test 0', noop);
      it('test 1', noop);
    `);

    return expect(report, 'to be fulfilled with', [
      'RUNNER_START',
      'ENV_START env1',
      'SESSION_START 1',
      'SUITE_START root',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_END root',
      'SESSION_END 1',
      'ENV_END env1',
      'RUNNER_END',
    ])
  });

  it('should not run describe without it', run => {
    const report = run(`
      describe('suite', () => {
        describe('suite 1', noop);
        describe('suite 2', noop);
      });
      describe('suite 3', noop);
    `);

    return expect(report, 'to be fulfilled with', [
      'RUNNER_START',
      'RUNNER_END',
    ]);
  });

  it('should process empty files', run => {
    const report = run(``);
    return expect(report, 'to be fulfilled with', [
      'RUNNER_START',
      'RUNNER_END',
    ]);
  });

  it('should run it inside describe', run => {
    const report = run(`
      describe('suite 1', () => {
        it('test 0', noop);
        it('test 1', noop);
        describe('suite 2', () => {
          it('test 2', noop);
        });
        describe('suite 3', () => {
          it('test 3', noop);
        });
        it('test 4', noop);
      });
      
      describe('suite 4', () => {
        it('test 5', noop);
      });
    `);

    return expect(report, 'to be fulfilled with', [
      'RUNNER_START',
      'ENV_START env1',
      'SESSION_START 1',
      'SUITE_START root',
      'SUITE_START suite 1',
      'TEST_END test 0',
      'TEST_END test 1',
      'SUITE_START suite 2',
      'TEST_END test 2',
      'SUITE_END suite 2',
      'SUITE_START suite 3',
      'TEST_END test 3',
      'SUITE_END suite 3',
      'TEST_END test 4',
      'SUITE_END suite 1',
      'SUITE_START suite 4',
      'TEST_END test 5',
      'SUITE_END suite 4',
      'SUITE_END root',
      'SESSION_END 1',
      'ENV_END env1',
      'RUNNER_END',
    ])
  });

});

