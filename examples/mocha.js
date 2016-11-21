const Mocha = require('mocha');

const mocha = new Mocha();
mocha.addFile('./examples/mocha/test1.js');

const runner = mocha.run(function(failures){
  console.log('mocha failures:', failures);
  process.on('exit', function () {
    process.exit(failures);  // exit with non-zero status if there were failures
  });
});

// const events = [
//   'start',
//   'end',
//   'suite',
//   'suite end',
//   'test',
//   'test end',
//   'hook',
//   'hook end',
//   'pass',
//   'fail',
// ];
//
// events.forEach(event => {
//   runner.on(event, () => console.log('EVENT:', event));
// });

