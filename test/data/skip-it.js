describe('suite 1', () => {
  it('test 0', fn('test 0'));
  describe('suite 2', () => {
    $skip();
    it('test 1', fn('test 2'));
    describe('suite 3', () => {
      it('test 2', fn('test 2'));
    });
  });
});
