/**
 * Reporter that just put events into log
 */

const clc = require('cli-color');
const path = require('path');
const StickyCursor = require('../utils/sticky-cursor');
const events = require('../events');

module.exports = class ConsoleReporter {
  constructor() {
    this._envStat = new Map();
    this._cursor = null;
  }
  onEvent(event, data) {
    // console.log('console-reporter:', event, data.error)
    switch (event) {
      case events.START: {
        const {files, config, envs} = data;
        console.log(`Sheeva started.`);
        console.log(`Processed ${num(files.length)} file(s).`);
        console.log(`Running on ${num(envs.length)} env(s) with concurrency = ${num(config.concurrency)}.`);
        this._initEnvStat(envs);
        break;
      }
      case events.END: {
        this._cursor.unstick();
        console.log(`Done.`);
        break;
      }
      case events.ENV_START: {
        const stat = this._getStat(data.env);
        stat.label = data.label;
        stat.tests.total = data.testsCount;
        this._cursor = new StickyCursor();
        this._printEnvTestsStat(stat);
        break;
      }
      case events.ENV_END: {
        //console.log(event, data.env);
        break;
      }
      case events.SESSION_START: {
        const stat = this._getStat(data.env);
        const sessionStat = {
          index: stat.sessions.size,
          currentFile: '',
          done: false,
        };
        stat.sessions.set(data.session, sessionStat);
        this._printEnvSessionStat(sessionStat);
        break;
      }
      case events.SESSION_END: {
        const stat = this._getStat(data.env);
        const sessionStat = stat.sessions.get(data.session);
        sessionStat.currentFile = '';
        sessionStat.done = true;
        stat.sessions.set(data.session, sessionStat);
        this._printEnvSessionStat(sessionStat);
        break;
      }
      case events.SUITE_START: {
        if (!data.suite.parent) {
          const stat = this._getStat(data.env);
          const sessionStat = stat.sessions.get(data.session);
          sessionStat.currentFile = data.suite.name;
          stat.sessions.set(data.session, sessionStat);
          this._printEnvSessionStat(sessionStat);
        }
        break;
      }
      case events.SUITE_END: {
        // console.log(event);
        break;
      }
      case events.TEST_END: {
        const stat = this._getStat(data.env);
        stat.tests.ended++;
        if (data.error) {
          stat.tests.errors++;
          //console.log(`Env:`,data.env);
          //console.log(`FAIL:\n${formatTestError(data)}`);
          //processError(data);
        } else {
          stat.tests.success++;
        }
        this._printEnvTestsStat(stat);
        return;
      }
    }
    processError(data);
  }
  _initEnvStat(envs) {
    envs.forEach((env, index) => {
      this._envStat.set(env, {
        index,
        label: '',
        tests: {
          total: 0,
          running: 0,
          ended: 0,
          success: 0,
          errors: 0,
        },
        sessions: new Map()
      });
    });
  }
  _getStat(env) {
    return this._envStat.get(env);
  }
  _printEnvTestsStat({label, tests}) {
    let line = `${clc.bold(label)}: executed ${num(tests.ended)} of ${num(tests.total)} test(s) `;
    line += tests.errors ? clc.red(`${tests.errors} ERROR(S)`) : clc.green(`SUCCESS`);
    this._cursor.write(0, line);
  }
  _printEnvSessionStat({index, currentFile, done}) {
    let line = `Session #${index + 1}: `;
    if (currentFile) {
      const filename = path.basename(currentFile);
      line += `${filename}`;
    } else {
      line += done ? `done` : `starting...`;
    }
    this._cursor.write(index + 1, line);
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
  return clc.blue.bold(str);
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
