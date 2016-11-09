
before(fn('before 0'));
beforeEach(fn('beforeEach 0'));
after(fn('after 0'));
afterEach(fn('afterEach 0'));

describe('suite', () => {
  before(fn('suite before 0'));
  beforeEach(fn('suite beforeEach 0'));
  after(fn('suite after 0'));
  afterEach(fn('suite afterEach 0'));

  it('test 0', fn('test 0'));
  it('test 1', fn('test 1'));
});
