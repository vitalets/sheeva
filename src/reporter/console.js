/**
 * Reporter that just put events into log
 */

// const status = require('node-status');
const {bold, blue, green, red} = require('colors/safe');
const events = require('../events');

module.exports = class ConsoleReporter {
  constructor() {
    this._envFiles = new Map();
  }
  onEvent(event, data) {
    // console.log('console-reporter:', event, data.error)
    switch (event) {
      case events.START: {
        const {files, config, envs} = data;
        console.log(`Processed ${num(files.length)} file(s).`);
        console.log(`Running on ${num(envs.length)} env(s) with concurrency = ${num(config.concurrency)}.`);
        this._initEnvFiles(envs);
        break;
      }
      case events.END: {
        console.log('');
        console.log(`Done.`);
        break;
      }
      case events.ENV_START: {
        const stat = this._getStat(data.env);
        stat.label = data.label;
        stat.total = data.queues.reduce((res, queue) => res + queue.tests.length, 0);
        console.log('');
        this._printEnvStat(stat);
        break;
      }
      case events.ENV_END: {
        //console.log(event, data.env);
        break;
      }
      case events.SESSION_START: {
        // console.log(event);
        break;
      }
      case events.SESSION_END: {
        // console.log(event);
        break;
      }
      case events.SUITE_START: {
        // console.log(event);
        break;
      }
      case events.SUITE_END: {
        // console.log(event);
        break;
      }
      case events.TEST_END: {
        const stat = this._getStat(data.env);
        stat.ended++;
        if (data.error) {
          stat.errors++;
          //console.log(`Env:`,data.env);
          //console.log(`FAIL:\n${formatTestError(data)}`);
          //processError(data);
        } else {
          stat.success++;
        }
        this._printEnvStat(stat);
        return;
      }
    }
    processError(data);
  }
  _initEnvFiles(envs) {
    envs.forEach((env, index) => {
      this._envFiles.set(env, {
        index,
        label: '',
        total: 0,
        running: 0,
        ended: 0,
        success: 0,
        errors: 0,
      });
    });
  }
  _getStat(env) {
    return this._envFiles.get(env);
  }
  _printEnvStat({label, total, ended, errors}) {
    let line = `${bold(label)}: executed ${num(ended)} of ${num(total)} test(s) `;
    line += errors ? red(`${errors} ERROR(S)`) : green(`SUCCESS`);

    //console.log(line);
    process.stdout.write(`\r${line}`);
  }
};

function processError(data) {
  const error = data && data.error;
  if (error) {
    console.log(error.name === 'UnexpectedError' ? error.message : error);
  }
}

function formatTestError(data) {
  return []
    .concat(data.test.parents.map(suite => suite.name))
    .concat([data.test.name])
    .map((item, i) => ' '.repeat(i * 2) + item)
    .join('\n');
}

function num(str) {
  return blue.bold(str);
}

/*
Karma output:

 13 11 2016 17:10:14.489:INFO [Chrome 54.0.2840 (Mac OS X 10.11.6)]: Connected on socket /#jqOXBVZ6-kqrz-FVAAAB with id 33112103
 Chrome 56.0.2918 (Mac OS X 10.11.6) exists should return true for existing file FAILED
 AssertionError: expected false to be truthy
 at doAsserterAsyncAndAddThen (node_modules/chai-as-promised/lib/chai-as-promised.js:296:33)
 at Assertion.<anonymous> (node_modules/chai-as-promised/lib/chai-as-promised.js:286:25)
 at Assertion.get (node_modules/chai/chai.js:5396:37)
 at Function.assert.isOk (node_modules/chai/chai.js:2236:31)
 at node_modules/chai-as-promised/lib/chai-as-promised.js:362:57
 Chrome 54.0.2840 (Mac OS X 10.11.6) exists should return true for existing file FAILED
 AssertionError: expected false to be truthy
 at doAsserterAsyncAndAddThen (node_modules/chai-as-promised/lib/chai-as-promised.js:296:33)
 at Assertion.<anonymous> (node_modules/chai-as-promised/lib/chai-as-promised.js:286:25)
 at Assertion.get (node_modules/chai/chai.js:5396:37)
 at Function.assert.isOk (node_modules/chai/chai.js:2236:31)
 at node_modules/chai-as-promised/lib/chai-as-promised.js:362:57
 Chrome 56.0.2918 (Mac OS X 10.11.6): Executed 56 of 56 (1 FAILED) (1.42 secs / 0.831 secs)
 Chrome 54.0.2840 (Mac OS X 10.11.6): Executed 56 of 56 (1 FAILED) (1.578 secs / 0.946 secs)
 TOTAL: 2 FAILED, 110 SUCCESS

 */
