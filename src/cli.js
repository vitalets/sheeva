#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const Sheeva = require('.');

const DEFAULT_CONFIG = './sheeva.config.js';

program
  .version(require('../package.json').version)
  .usage('[options] <test files ...>')
  .option('--config <path>', 'path to configuration file')
  .option('--concurrency <number>', 'number of concurrent sessions')
  .option('--reporters <string>', 'comma separated reporters')
  .parse(process.argv);

run();

function run() {
  const config = getConfig();
  if (program.reporters) {
    config.reporters = program.reporters.split(',');
  }
  if (program.concurrency) {
    config.concurrency = parseInt(program.concurrency, 10);
  }
  if (program.args.length) {
    config.files = program.args;
  }
  new Sheeva(config).run().then(res => exit(res.errors.length), () => exit(1));
}

function exit(exitCode) {
  // use process on exit to allow finish pending operations
  process.on('exit', () => process.exit(exitCode));
}

function getConfig() {
  if (program.config) {
    return require(path.resolve(program.config));
  } else {
    try {
      return require(path.resolve(DEFAULT_CONFIG));
    } catch(e) {}
  }
  return {};
}
