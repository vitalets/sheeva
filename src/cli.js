#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const Sheeva = require('.');
const defaults = require('./configurator/defaults');

const DEFAULT_CONFIG = './sheeva.config.js';

program
  .version(require('../package.json').version)
  .usage('[options] <test files ...>')
  .option('--config <path>', 'path to configuration file')
  .option('--concurrency <number>', 'number of concurrent sessions')
  .option('--reporters <string>', 'comma separated reporters')
  .option('--env <string>', 'environment id to run')
  .option('--split-suites', 'allows split of suites between parallel sessions')
  .option('--no-only', 'disallow ONLY tests. Useful for pre-commit / pre-push hooks')
  .option('--debug', 'debug mode')
  .parse(process.argv);

run();

function run() {
  const inConfig = applyFlags(tryReadConfigFile());
  const sheeva = new Sheeva(inConfig);
  sheeva
    .run()
    .then(res => success(res), e => fail(sheeva, e));
}

function success(res) {
  exit(res.errors.length);
}

function fail(sheeva, e) {
  // if there is no reporter or debug mode --> show sheeva error in console
  try {
    if (!sheeva.getReporter(0) || sheeva.getConfig().debug) {
      console.error(e);
    }
  } catch (err) {
    console.error(err);
  }
  exit(1);
}

function exit(exitCode) {
  // use process on exit to let pending operations finish
  process.on('exit', () => process.exit(exitCode));
}

function tryReadConfigFile() {
  if (program.config) {
    return require(path.resolve(program.config));
  } else {
    try {
      return require(path.resolve(DEFAULT_CONFIG));
    } catch(e) {}
  }
  return {};
}

function applyFlags(inConfig) {
  // see https://github.com/tj/commander.js/issues/238
  program.noOnly = !program.only;
  mergeDefaults(inConfig);
  applyFiles(inConfig);
  applyReporters(inConfig);
  return inConfig;
}

function mergeDefaults(inConfig) {
  Object.keys(defaults).forEach(key => {
    if (typeof defaults[key] !== 'function' && program[key] !== undefined) {
      inConfig[key] = Array.isArray(defaults[key])
        ? program[key].split(',')
        : program[key];
    }
  });
}

function applyFiles(inConfig) {
  if (program.args.length) {
    inConfig.files = program.args;
  }
}

function applyReporters(inConfig) {
  if (typeof inConfig.reporters === 'string') {
    inConfig.reporters = require(path.resolve(inConfig.reporters));
  }
}
