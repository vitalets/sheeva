
describe('suite 1', () => {
  it('test 0', fn('test 0'));
  describe('suite 2', () => {
    $only();
    it('test 1', fn('test 2'));
    describe('suite 3', () => {
      it('test 2', fn('test 2'));
    });
  });
});

describe('suite 4', () => {
  it('test 4', fn('test 4'));
  it('test 5', fn('test 5'));
});
