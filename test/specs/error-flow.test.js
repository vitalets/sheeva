
const path = require('path');

describe('error flow', () => {

  function error() {
    throw new Error('err');
  }

  beforeEach(() => {
    fn.clear();
    const absPath = path.resolve('./test/data/it-hooks.js');
    delete require.cache[absPath];
  });

  it('should run all hooks in case of test error', () => {
    fn.once('test 1', error);
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
      'TEST_END test 1 err',
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
      'SUITE_END root'
    ]);
  });

  it('should run skip suite in case of before error', () => {
    fn.once('before 1', error);
    const sheeva = new Sheeva({files: './test/data/it-hooks.js'});
    sheeva.run();
    expect(sheeva.collector.log, 'to equal', [
      'SUITE_START root',
      'HOOK_START root before 0',
      'HOOK_END root before 0 err',
      'HOOK_START root after 0',
      'HOOK_END root after 0',
      'HOOK_START root after 1',
      'HOOK_END root after 1',
      'SUITE_END root'
    ]);
  });

});
