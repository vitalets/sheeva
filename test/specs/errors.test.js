
describe('errors', () => {

  it('should reject run() promise in case of error in describe', run => {
    const result = run(`
      throw new Error('err');
    `);

    return expect(result, 'to be rejected with', new Error('err'));
  });

  it('should run all hooks in case of test error', run => {
    const report = run(`
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
    `);

    return expect(report, 'to be fulfilled with', [
      'SESSION_START 1',
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
      'SESSION_END 1',
    ]);
  });

  describe('hooks', () => {

    it('should skip suite in case of before error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
        'SUITE_START root',
        'HOOK_END root before 0 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should skip suite in case of before second error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should skip suite in case of beforeEach error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0 err',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should skip suite in case of beforeEach second error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1 err',
        'HOOK_END root afterEach 0',
        'HOOK_END root afterEach 1',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should skip rest of tests in case of afterEach error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
        'SUITE_START root',
        'HOOK_END root before 0',
        'HOOK_END root before 1',
        'HOOK_END root beforeEach 0',
        'HOOK_END root beforeEach 1',
        'TEST_END test 0',
        'HOOK_END root afterEach 0 err',
        'HOOK_END root after 0',
        'HOOK_END root after 1',
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should skip rest of tests in case of afterEach second error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
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
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should run all hooks in case of after error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
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
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

    it('should run all hooks in case of after second error', run => {
      const report = run(`
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
      `);

      return expect(report, 'to be fulfilled with', [
        'SESSION_START 1',
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
        'SUITE_END root err',
        'SESSION_END 1',
      ]);
    });

  });

});
