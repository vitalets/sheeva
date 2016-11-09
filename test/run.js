
const path = require('path');
const expect = require('unexpected');
const Sheeva = require('../src');

global.expect = expect;
global.Sheeva = Sheeva;
global.fn = require('./calls');
global.run = function (file) {
  const sheeva = new Sheeva({
    reporters: require('./reporter'),
    files: file
  });
  const absPath = path.resolve(file);
  delete require.cache[absPath];
  sheeva.run();
  return sheeva.getReporter(0).log;
};

const config = {
  files: './test/specs/*.js'
  //files: './test/specs/only.test.js'
};
new Sheeva(config).run();


