
const generate = require('../generate');

// serial();
describe('suite 1', () => {

  generate.hooks('');

  generate.it('  test {i}', 5);

  skip(env => env.browser !== 'chrome');
  describe('sub suite 1', () => {
    generate.hooks('   sub');

    generate.it('      sub test {i}', 3);
  });

  after(() => console.log('one more after'));

});



