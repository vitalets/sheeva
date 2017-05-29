$if(target => target.id === 'sync-target');
describe('annotation: data', () => {

  it('should attach data to test', run => {
    const assertions = {
      '0.data.test.data.id': 123,
      '1.data.test.data': null,
    };
    const result = run(`
      describe('suite 1', () => {
        $data({id: 123});
        it('test 0', () => noop);
        it('test 1', () => noop);
      });
    `, {rawEvents: Object.keys(assertions)});

    return expectResolve(result)
      .then(res => expect(res, 'to equal', assertions));
  });

  it('should attach data to suite', run => {
    const assertions = {
      '0.data.suite.data.id': 123
    };
    const result = run(`
      $data({id: 123});
      describe('suite 1', () => {
        it('test 0', () => noop);
      });
    `, {include: ['SUITE_END'], rawEvents: Object.keys(assertions)});

    return expectResolve(result)
      .then(res => expect(res, 'to equal', assertions));
  });

});
