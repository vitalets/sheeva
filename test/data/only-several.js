
describe('suite', () => {
  $only();
  it('test 0', fn('test 0'));
  it('test 1', fn('test 1'));
});

describe('suite 2', () => {
  it('test 2', fn('test 2'));
  $only();
  it('test 3', fn('test 3'));
});

describe('suite 3', () => {
  $only();
  describe('suite 4', () => {
    it('test 4', fn('test 4'));
  });
});