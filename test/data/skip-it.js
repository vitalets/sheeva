describe('suite 1', () => {
  it('test 0', noop);
  describe('suite 2', () => {
    $skip();
    it('test 1', noop);
    describe('suite 3', () => {
      it('test 2', noop);
    });
  });
});
