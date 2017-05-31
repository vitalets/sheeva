'use strict';


describe('errors in suite', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END'];
  });

  it('should reject run in case of error in describe fn', run => {
    const result = run(`
      describe('suite 1', () => {
        throw new Error('err');
      });  
    `);

    return expectReject(result, 'err');
  });

});
