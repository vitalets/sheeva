<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1473072/25821119/9278f514-343c-11e7-97ac-839e3ec64a7a.png"/>
</p>
<h1 align="center">Sheeva</h1>
<p align="center">
  <a title='build status' href="https://npmjs.org/package/sheeva"><img src='https://travis-ci.org/vitalets/sheeva.svg?branch=master'/></a>
  <a title='npm version' href="https://npmjs.org/package/sheeva"><img src='http://img.shields.io/npm/v/sheeva.svg'/></a>
  <a title='License' href="https://opensource.org/licenses/MIT"><img src='https://img.shields.io/badge/license-MIT-blue.svg'/></a>
</p>

<h4 align="center">
  Concurrent Automation Test Runner
</h4>

***

**Main features:**  
* Parallelization per browser or per mobile device, per suite and even per particular test
* Flexible annotations for conditional test run, re-tries, nested groups, timeouts and tags
* [Mocha](https://mochajs.org)-like syntax compatible with 
[Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver), 
[Webdriverio](http://webdriver.io) and other testing frameworks

Learn more in [Why special runner?](#) section.

## Contents
 * [Demo](#demo)
 * [Install](#)
 * [Getting started](#)
 * [Configuration](#)
 * [API](#)
   * [Tests](#)
   * [Annotations](#)
 * [Examples](#)
 * [Why special runner?](#whyspecialrunner)

## Demo

## Why special runner?
Automation tests are different from unit tests.
Their requirements to runner are:

* **Parallelization per environment**  
   Run the same tests on different browsers, smartphones and platforms.

* **Parallelization per test**   
   Split suites and run each test/sub-suite in parallel.
   
* **Conditional skip/only**  
   Skip or run particular test in particular environment.
   
* **Concurrency limit**  
   Run on pre-defined number of concurrent sessions.
   
* **Nested groups**   
   Create nested test groups with common before/after hooks to reduce boilerplate code.

* **Smart tests splitting**  
   Smart algorithm for splitting tests between parallel sessions to have minimal execution time.
   
* **Progressive retries**  
   Give test a chance to re-run if it tightly depends on extra conditions (e.g. network state).
   
* **Tags**   
   Group and run tests by tags (e.g. *smoke*, *normal*, *full*) 
      
Sheeva tries to fulfill all these requirements.

## Errors handling
There are several types of errors that may occur while running tests:  

1. **Error in test**  
  It can be assertion error or error in test code itself. In that case all `afterEach` hooks are called,
  error is reported via `TEST_END` event and runner goes to the next test.
 
2. **Error in beforeEach hook**  
   Runner will not call test itself but will call all needed `afterEach` 
   hooks for proper cleanup. Then runner goes to the end of error suite, calls all needed `after` hooks
   and starts next suite.
   
2. **Error in afterEach hook**  
   Runner will anyway call all needed `afterEach` hooks for proper cleanup. 
   Then runner goes to the end of error suite, calls all needed `after` hooks
   and starts next suite. 
 
3. **Error in before hook**  
   Runner will not call any tests of that suite. Instead it goes to the end of that suite, 
   calls all needed `after` hooks and starts next suite.

3. **Error in after hook**  
   Runner will anyway call all needed `after` hooks for proper cleanup and start next suite.

4. **Error in runner**  
   This may be internal error in Sheeva itself or in configuraiton methods such as `config.startSession`. 
   In that case runner terminates immediately and `sheeva.run()` rejects with that error.
  
*Note 1:* reporter is responsible for displaying all errors except runner error.  
*Note 2:* if `config.breakOnError` is enabled then runner will terminate on any error.  
*Note 3:* there can be several errors at once, e.g. error in `before` hook can cause error in `after` hook.  
