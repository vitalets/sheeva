# Sheeva
Multi-Hand Runner for Browser Automation Tests

## Why special runner?
Because browser automation tests are different from unit tests.
Their requirements to runner are:

1. **Run in parallel on environment level**  
   It should easily run the same tests on different browsers and environments.

2. **Run in parallel on test level**   
   It should be able to run each describe/it in parallel to reduce total time.

3. **Groups**   
   As tests are slow it is reasonable to group them (e.g. *smoke*, *normal*, *full*) 
   and run each group separately. 
 
4. **Conditional skip**  
   Browsers are different. Some features should not be tested on particular environment/browser. 
   It should be easy to skip test for some condition.

5. **Nested** ?

