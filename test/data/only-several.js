
describe('suite', () => {
  $only();
  it('test 0', noop);
  it('test 1', noop);
});

describe('suite 2', () => {
  it('test 2', noop);
  $only();
  it('test 3', noop);
});

describe('suite 3', () => {
  $only();
  describe('suite 4', () => {
    it('test 4', noop);
  });
});
