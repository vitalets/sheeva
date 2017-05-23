$if(target => target.id === 'sync-target');
describe('annotation: data', () => {

  it('should attach data to test', run => {
    const result = run(`
      describe('suite 1', () => {
        $data({id: 123});
        it('test 0', () => noop);
        it('test 1', () => noop);
      });
    `, {raw: true});

    return expectResolve(result).then(result => {
      expect(result[0].data.test.data, 'to equal', {id: 123});
      expect(result[1].data.test.data, 'to equal', null);
    });
  });

  it('should attach data to suite', run => {
    const result = run(`
      $data({id: 123});
      describe('suite 1', () => {
        it('test 0', () => noop);
      });
    `, {raw: true, include: ['SUITE_END']});

    return expectResolve(result).then(result => {
      expect(result[0].data.suite.data, 'to equal', {id: 123});
    });
  });

});
