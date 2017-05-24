#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const Sheeva = require('.');
const defaults = require('./config/defaults');

const DEFAULT_CONFIG = './sheeva.config.js';

program
  .version(require('../package.json').version)
  .usage('[options] <test files ...>')
  .option('--config <path>', 'path to configuration file')
  .option('--concurrency <number>', 'number of concurrent sessions')
  .option('--reporters <string>', 'comma separated reporters')
  .option('--target <string>', 'target id to run')
  .option('--split-suites', 'allows split of suites between parallel sessions')
  .option('--no-only', 'disallow ONLY tests. Useful for pre commit / pre push hooks')
  .option('--break-on-error', 'break on first error')
  .option('--timeout <number>', 'global timeout')
  .parse(process.argv);

run();

function run() {
  processCliValues();
  const inConfig = tryReadConfigFile() || {};
  setValues(inConfig);
  const sheeva = new Sheeva(inConfig);
  sheeva.run().then(success, fail);
}

function success(res) {
  exit(res.errors.size);
}

function fail(runnerError) {
  console.error(runnerError); // eslint-disable-line no-console
  exit(1);
}

function exit(exitCode) {
  // use process on exit to let pending operations finish
  process.on('exit', () => process.exit(exitCode));
}

function processCliValues() {
  // see https://github.com/tj/commander.js/issues/238
  program.noOnly = !program.only;

  if (program.args.length) {
    program.files = program.args;
  }

  if (program.reporters) {
    program.reporters = require(path.resolve(program.reporters));
  }
}

function tryReadConfigFile() {
  if (program.config) {
    return require(path.resolve(program.config));
  } else {
    try {
      return require(path.resolve(DEFAULT_CONFIG));
    } catch(e) {
      // default config may not exist
    }
  }
}

function setValues(inConfig) {
  Object.keys(defaults).forEach(key => {
    const defaultValue = defaults[key];
    const cliValue = program[key];
    if (typeof defaultValue !== 'function' && cliValue !== undefined) {
      inConfig[key] = cliValue;
    }
  });
}
