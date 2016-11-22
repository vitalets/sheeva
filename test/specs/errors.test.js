
describe('errors', () => {

  it('should reject run() promise in case of error in describe', session => {
    const result = runCode(`
      throw new Error('err');
    `, session);

    return expect(result, 'to be rejected with', new Error('err'));
  });

  it('should run all hooks in case of test error', session => {
    const report = runCode(`
      before(noop);
      before(noop);
      
      beforeEach(noop);
      beforeEach(noop);

      afterEach(noop);
      afterEach(noop);      
      
      after(noop);
      after(noop);
      
      it('test 0', () => { throw new Error('err') });
      it('test 1', noop);
    `, session);

    return expect(report, 'to be fulfilled with', [
      'SUITE_START root',
      'HOOK_END root before 0',
      'HOOK_END root before 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 0 err',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root beforeEach 0',
      'HOOK_END root beforeEach 1',
      'TEST_END test 1',
      'HOOK_END root afterEach 0',
      'HOOK_END root afterEach 1',
      'HOOK_END root after 0',
      'HOOK_END root after 1',
      'SUITE_END root',
    ]);
  });

  describe('hooks', () => {

    it('should skip suite in case of before error', session => {
      const report = runCode(`
        before(() => { throw new Error('err') });
        before(noop);
        
        beforeEach(noop);
        beforeEach(noop);

        afterEach(noop);
        afterEach(noop);        
        
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of before second error', session => {
      const report = runCode(`
        before(noop);
        before(() => { throw new Error('err') });
        
        beforeEach(noop);
        beforeEach(noop);

        afterEach(noop);
        afterEach(noop);        
        
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of beforeEach error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(() => { throw new Error('err') });
        beforeEach(noop);

        afterEach(noop);
        afterEach(noop);        
        
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0 err',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of beforeEach second error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(noop);
        beforeEach(() => { throw new Error('err') });

        afterEach(noop);
        afterEach(noop);        
        
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1 err',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should skip rest of tests in case of afterEach error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(noop);
        beforeEach(noop);

        afterEach(() => { throw new Error('err') });
        afterEach(noop);        
        
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 0',
        'HOOK_END root afterEach 0 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should skip rest of tests in case of afterEach second error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(noop);
        beforeEach(noop);
        
        afterEach(noop);
        afterEach(() => { throw new Error('err') });
                
        after(noop);
        after(noop);
        
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 0',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err'
      ]);
    });

    it('should run all hooks in case of after error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(noop);
        beforeEach(noop);
        
        afterEach(noop);
        afterEach(noop);
        
        after(() => { throw new Error('err') });
        after(noop);
       
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 0',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 1',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0 err',
        'SUITE_END root err'
      ]);
    });

    it('should run all hooks in case of after second error', session => {
      const report = runCode(`
        before(noop);
        before(noop);
        
        beforeEach(noop);
        beforeEach(noop);
        
        afterEach(noop);
        afterEach(noop);
        
        after(noop);
        after(() => { throw new Error('err') });
       
        it('test 0', noop);
        it('test 1', noop);
      `, session);

      return expect(report, 'to be fulfilled with', [
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 0',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 1',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0',
        'HOOK_END root after 1 err',
        'SUITE_END root err'
      ]);
    });

  });

});
