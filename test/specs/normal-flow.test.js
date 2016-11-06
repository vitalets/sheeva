
describe('normal flow', () => {

  beforeEach(() => {
    fn.clear();
  });

  it('should run it without describe', () => {
    const sheeva = new Sheeva({files: './test/data/it.js'});
    sheeva.run();
    expect(sheeva.collector.log, 'to equal', [
      'SUITE_START root',
      'TEST_START test 1',
      'TEST_END test 1',
      'TEST_START test 2',
      'TEST_END test 2',
      'SUITE_END root',
    ])
  });

  it('should run it and all hooks within describe', () => {
    const sheeva = new Sheeva({files: './test/data/it-hooks.js'});
    sheeva.run();
    expect(sheeva.collector.log, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0',
      'HOOK_START root before 1',
      'HOOK_END root before 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 1',
      'TEST_END test 1',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root beforeEach 0',
      'HOOK_END root beforeEach 0',
      'HOOK_START root beforeEach 1',
      'HOOK_END root beforeEach 1',
      'TEST_START test 2',
      'TEST_END test 2',
      'HOOK_START root afterEach 0',
      'HOOK_END root afterEach 0',
      'HOOK_START root afterEach 1',
      'HOOK_END root afterEach 1',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root',
    ]);
  });

  it('should run it with describe', () => {
    const sheeva = new Sheeva({files: './test/data/describe-it.js'});
    sheeva.run();
    expect(sheeva.collector.log, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'TEST_START test 1',
      'TEST_END test 1',
      'TEST_START test 2',
      'TEST_END test 2',
      'SUITE_END suite',
      'SUITE_END root',
    ])
  });

  it('should run it and all hooks within describe', () => {
    const sheeva = new Sheeva({files: './test/data/describe-it-hooks.js'});
    sheeva.run();
    expect(sheeva.collector.log, 'to equal', [
      'SUITE_START root',
      'SUITE_START suite',
      'HOOK_START suite before 0',
      'HOOK_END suite before 0',
      'HOOK_START suite before 1',
      'HOOK_END suite before 1',
      'HOOK_START suite beforeEach 0',
      'HOOK_END suite beforeEach 0',
      'HOOK_START suite beforeEach 1',
      'HOOK_END suite beforeEach 1',
      'TEST_START test 1',
      'TEST_END test 1',
      'HOOK_START suite afterEach 0',
      'HOOK_END suite afterEach 0',
      'HOOK_START suite afterEach 1',
      'HOOK_END suite afterEach 1',
      'HOOK_START suite beforeEach 0',
      'HOOK_END suite beforeEach 0',
      'HOOK_START suite beforeEach 1',
      'HOOK_END suite beforeEach 1',
      'TEST_START test 2',
      'TEST_END test 2',
      'HOOK_START suite afterEach 0',
      'HOOK_END suite afterEach 0',
      'HOOK_START suite afterEach 1',
      'HOOK_END suite afterEach 1',
      'HOOK_START suite after 0',
      'HOOK_END suite after 0',
      'HOOK_START suite after 1',
      'HOOK_END suite after 1',
      'SUITE_END suite',
      'SUITE_END root',
    ]);
  });

});

