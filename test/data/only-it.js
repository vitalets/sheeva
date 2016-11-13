
describe('suite 1', () => {
  it('test 0', noop);
  describe('suite 2', () => {
    $only();
    it('test 1', noop);
    describe('suite 3', () => {
      it('test 2', noop);
    });
  });
});

describe('suite 4', () => {
  it('test 4', noop);
  it('test 5', noop);
});
