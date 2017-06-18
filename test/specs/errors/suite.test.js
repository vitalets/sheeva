'use strict';


describe('errors in suite', () => {

  beforeEach(context => {
    context.options.include = ['HOOK_END', 'TEST_END'];
  });

  it('should reject run in case of error in describe fn', run => {
    const output = run(`
      describe('suite 1', () => {
        throw new Error('err');
      });  
    `);

    return expectReject(output, 'err');
  });

});
