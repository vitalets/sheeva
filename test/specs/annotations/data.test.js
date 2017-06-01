'use strict';

$if(isSyncTarget);
describe('annotation: data', () => {

  beforeEach(context => {
    context.runOptions.output = 'rawReport';
  });

  it('should attach data to test', run => {
    const assertions = {
      '0.data.test.data.id': 123,
      '1.data.test.data': null,
    };
    const output = run(`
      describe('suite 1', () => {
        $data({id: 123});
        it('test 0', () => noop);
        it('test 1', () => noop);
      });
    `, {keys: assertions});

    return expectResolve(output)
      .then(res => expect(res, 'to equal', assertions));
  });

  it('should attach data to suite', run => {
    const assertions = {
      '0.data.suite.data.id': 123
    };
    const output = run(`
      $data({id: 123});
      describe('suite 1', () => {
        it('test 0', () => noop);
      });
    `, {include: ['SUITE_END'], keys: assertions});

    return expectResolve(output)
      .then(res => expect(res, 'to equal', assertions));
  });

});
