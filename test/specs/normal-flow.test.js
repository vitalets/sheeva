
describe('normal flow', () => {

  beforeEach(() => {
    fn.clear();
  });

  it('should run it without describe', () => {
    new Sheeva({files: './test/data/it.js'}).run();
    expect(fn.calls, 'to equal', [
      'test 1',
      'test 2',
    ])
  });

  it('should run it and all hooks within describe', () => {
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
    ]);
  });

  it('should run it with describe', () => {
    new Sheeva({files: './test/data/describe-it.js'}).run();
    expect(fn.calls, 'to equal', [
      'test 1',
      'test 2'
    ])
  });

  it('should run it and all hooks within describe', () => {
    new Sheeva({files: './test/data/describe-it-hooks.js'}).run();
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
    ]);
  });

});

