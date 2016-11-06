
global.expect = require('unexpected');
global.Sheeva = require('../src');
global.fn = require('./calls');

const config = {
  //files: './test/specs/*.js'
  files: './test/specs/normal-flow.test.js'
  //files: './test/specs/error-flow.test.js'
};
new Sheeva(config).run();


