describe('error flow', () => {

  function error() {
    throw new Error('err');
  }

  beforeEach(() => {
    fn.clear();
  });

  it('should run all hooks in case of test error', () => {
    fn.once('test 1', error);
    new Sheeva({files: './test/data/it-hooks.js'}).run();
    expect(fn.calls, 'to equal', [
      'before 1',
      'before 2',
      'beforeEach 1',
      'beforeEach 2',
      'test 1',
      'afterEach 1',
      'afterEach 2',
      'beforeEach 1',
      'beforeEach 2',
      'test 2',
      'afterEach 1',
      'afterEach 2',
      'after 1',
      'after 2',
    ])
  });

});
