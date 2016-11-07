
describe('suite', () => {
  before(fn('before 0'));
  before(fn('before 1'));

  beforeEach(fn('beforeEach 0'));
  beforeEach(fn('beforeEach 1'));

  after(fn('after 0'));
  after(fn('after 1'));

  afterEach(fn('afterEach 0'));
  afterEach(fn('afterEach 1'));

  it('test 0', fn('test 0'));
  it('test 1', fn('test 1'));
});
