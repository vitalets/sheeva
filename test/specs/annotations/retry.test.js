$if(env => env.id === 'sync-env');
describe('annotation: retry', () => {

  const include = ['HOOK_END', 'TEST'];

  it('should retry test', run => {
    const result = run(`
      describe('suite 1', () => {
        before(noop);
        after(noop);
        beforeEach(noop);
        afterEach(noop);
        
        $retry();
        it('test 0', (ctx, session, attempt) => { throw new Error('err' + attempt) });
      });
    `, {include});

    return expectResolve(result, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 1 beforeEach',
      'TEST_START test 0',
      'TEST_RETRY test 0 err0',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 beforeEach',
      'TEST_START test 0',
      'TEST_END test 0 err1',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 after'
    ]);
  });

  it('should retry 2 times', run => {
    const result = run(`
      describe('suite 1', () => {
        before(noop);
        after(noop);
        beforeEach(noop);
        afterEach(noop);
        
        $retry(2);
        it('test 0', (ctx, session, attempt) => { throw new Error('err' + attempt) });
      });
    `, {include});

    return expectResolve(result, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 1 beforeEach',
      'TEST_START test 0',
      'TEST_RETRY test 0 err0',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 beforeEach',
      'TEST_START test 0',
      'TEST_RETRY test 0 err1',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 beforeEach',
      'TEST_START test 0',
      'TEST_END test 0 err2',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 1 after'
    ]);
  });

  it('should retry with increased timeout of test failed by timeout', run => {
    const result = run(`
      describe('suite 1', () => {
        $retry();
        $timeout(10)
        it('test 0', () => sleep(12));
      });
    `, {include: ['TEST']});

    return expectResolve(result, [
      'TEST_START test 0',
      'TEST_RETRY test 0 Timeout 10 ms exceeded',
      'TEST_START test 0',
      'TEST_END test 0',
    ]);
  });

});
