<h1 align="center">Sheeva</h1>

<p align="center">
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

## Handling errors
There are 3 types of errors during execution:  

1. **Error in test**  
  It can be assertion error or error in test code itself. In that case all `afterEach` hooks are called,
  error is reported via `TEST_END` event and runner goes to the next test.  
  Reporter is responsible for displaying such error.
 
2. **Error in hook**  
  When error occurs in hook of some suite there is no sense to continue running tests of that suite. 
  So runner goes to the end of suite, calls needed `after` hooks, emits `SUITE_END` event with error
  and takes next suite.  
  Reporter is responsible for displaying such error.

3. **Error in runner**  
  This is error owned by developers of Sheeva. In that case runner terminates immediately and rejects with that error.  
  Reporter is not responsible for displaying such error, it will be shown in console until you catch it.
  
*Note 1:* if `config.breakOnError` is enabled then runner will terminate on any error.  
*Note 2:* there can be several errors at once, e.g. error in `before` hook can cause error in `after` hook.  
