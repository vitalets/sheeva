#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const Sheeva = require('.');

program
  .version(require('../package.json').version)
  .usage('[options] <test files ...>')
  .option('--config <path>', 'path to configuration file', './sheeva.config.js')
  .parse(process.argv);

run();

function run() {
  const config = require(path.resolve(program.config));

  if (program.args.length) {
    config.files = program.args;
  }

  new Sheeva(config).run().then(success, fail);
}

function success(result) {
  process.exit(result && result.errors || 1);
}

function fail() {
  process.exit(1);
}
