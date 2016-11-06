serial();
describe('suite 2', () => {

  //tags('smoke');
  //skip(env => env.browser !== 'chrome');
  //only();
  runIf(false);
  it('test 1 (suite2)', driver => {
    console.log('(suite2) test 1');
  });

});

it('top test 1', driver => {
  console.log('(suite2) top test 1');
});

// const s = require('sheeva');
/*
describe('suite 2')
  .serial()
  .skip(env => env.browser !== 'chrome')
  .if(env => env.browser !== 'chrome')
  .fn(() => {

    it('test 1 (suite2)')
      .tags('smoke')
      .skip(env => env.browser !== 'chrome')
      .fn(driver => {
        console.log('test 1 (suite2)', driver);
      });


  });
*/
