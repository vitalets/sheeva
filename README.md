# Sheeva
Multi-Hand Automation Test Runner

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
   Run on predefined number of concurrent sessions.
   
* **Nested groups**   
   Create nested test groups with common before/after hooks to reduce boilerplate code.

* **Smart tests split**  
   Automatically allocate tests between parallel sessions to have minimal execution time.
   
* **Retries**  
   Give test a chance to re-run if it tightly depends on extra conditions (e.g. network state).
   
* **Tags**   
   Group and run tests by tags (e.g. *smoke*, *normal*, *full*) 
      
Sheeva tries to fulfill all these requirements.
