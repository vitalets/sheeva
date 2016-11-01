# Sheeva
Multi-Hand Automation Test Runner

## Why special runner?
Automation tests are different from unit tests.
Their requirements to runner are:

* **Run in parallel on different environments**  
   It should be pretty easy run the same tests on different browsers, smartphones and platforms.

* **Run in parallel particular tests**   
   There can be long tests in the same suite/file. 
   It should be possible to run each test in parallel to reduce total execution time.

* **Nested groups**   
   Some tests require common preparation steps. To reduce boilerplate code it would be convenient
   to use nested suites (describes) with beforeEach/afterEach hooks. 

* **Conditional skip/only**  
   Environments are different. Some tests should be skipped for particular browser, and some should be executed
   only for particular one. Runner should allow to easily setup such conditions.
   
* **Tagging**   
   As tests are slow it is reasonable to group them somehow (e.g. *smoke*, *normal*, *full*) 
   and run each group separately.
    
* **Retries**  
   It should be possible to give test a chance to re-run if it is tightly depends on extra conditions
   (e.g. network state).
   
* **Concurrency limit**  
   Usually we are limited with number of environments to be used in parallel. It should be configurable.
   
* **Automatic tests allocation**  
   It would be great to automatically allocate tests between parallel sessions to have minimal total execution time.
   
Sheeva tries to fulfill all these requirements.

## Todo
Make benchmark with mocha, jasmine, AVA, tape (use https://github.com/wadey/node-microtime for mesure) 