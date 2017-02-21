
describe('errors', () => {

  beforeEach(context => {
    context.runOptions.include = ['HOOK_END', 'TEST_END'];
  });

  it('should reject run() promise in case of error in describe', run => {
    const result = run(`
      describe('suite 1', () => {
        throw new Error('err');
      });  
    `);

    return expectReject(result, {
      message: 'err'
    });
  });

  it('should run all hooks in case of test error', run => {
    const report = run(`
      describe('suite 1', () => {
        before(noop);
        after(noop);
        beforeEach(noop);
        afterEach(noop);

        describe('suite 2', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);        

          it('test 0', () => { throw new Error('err') });
        });
      });
    `);

    return expectResolve(report, [
      'HOOK_END suite 1 before',
      'HOOK_END suite 2 before',
      'HOOK_END suite 1 beforeEach',
      'HOOK_END suite 2 beforeEach',
      'TEST_END test 0 err',
      'HOOK_END suite 2 afterEach',
      'HOOK_END suite 1 afterEach',
      'HOOK_END suite 2 after',
      'HOOK_END suite 1 after'
    ]);
  });

  describe('before', () => {

    it('should pass error in before to suite end', run => {
      const report = run(`
        describe('suite 1', () => {
          before(() => { throw new Error('err') });
          it('test 0', noop);
        });
      `, {include: ['SUITE_END', 'HOOK_END']});

      return expectResolve(report, [
        'HOOK_END suite 1 before err',
        'SUITE_END suite 1 err',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of top before error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(() => { throw new Error('err') });
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before err',
        'HOOK_END suite 1 after',
      ]);
    });

    it('should skip suite in case of nested before error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(() => { throw new Error('err') });
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before err',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after'
      ]);
    });

  });

  describe('beforeEach', () => {

    it('should pass error in beforeEach to suite end', run => {
      const report = run(`
        describe('suite 1', () => {
          beforeEach(() => { throw new Error('err') });
          it('test 0', noop);
        });
      `, {include: ['SUITE_END', 'HOOK_END']});

      return expectResolve(report, [
        'HOOK_END suite 1 beforeEach err',
        'SUITE_END suite 1 err',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of top beforeEach error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(() => { throw new Error('err') });
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach err',
        'HOOK_END suite 1 afterEach',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after',
      ]);
    });

    it('should skip suite in case of nested beforeEach error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(() => { throw new Error('err') });
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach',
        'HOOK_END suite 2 beforeEach err',
        'HOOK_END suite 2 afterEach',
        'HOOK_END suite 1 afterEach',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after'
      ]);
    });

  });

  describe('afterEach', () => {

    it('should pass error in afterEach to suite end', run => {
      const report = run(`
        describe('suite 1', () => {
          afterEach(() => { throw new Error('err') });
          it('test 0', noop);
        });
      `, {include: ['SUITE_END', 'HOOK_END']});

      return expectResolve(report, [
        'HOOK_END suite 1 afterEach err',
        'SUITE_END suite 1 err',
        'SUITE_END root err'
      ]);
    });

    it('should skip suite in case of top afterEach error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(() => { throw new Error('err') });
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
            it('test 1', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach',
        'HOOK_END suite 2 beforeEach',
        'TEST_END test 0',
        'HOOK_END suite 2 afterEach',
        'HOOK_END suite 1 afterEach err',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after'
      ]);
    });

    it('should skip suite in case of nested afterEach error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(noop);
            afterEach(() => { throw new Error('err') });       
  
            it('test 0', noop);
            it('test 1', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach',
        'HOOK_END suite 2 beforeEach',
        'TEST_END test 0',
        'HOOK_END suite 2 afterEach err',
        'HOOK_END suite 1 afterEach',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after'
      ]);
    });

  });

  describe('after', () => {

    it('should pass error in after to suite end', run => {
      const report = run(`
        describe('suite 1', () => {
          after(() => { throw new Error('err') });
          it('test 0', noop);
        });
      `, {include: ['SUITE_END', 'HOOK_END']});

      return expectResolve(report, [
        'HOOK_END suite 1 after err',
        'SUITE_END suite 1 err',
        'SUITE_END root err'
      ]);
    });

    it('should run all hooks in case of top after error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(() => { throw new Error('err') });
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(noop);
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach',
        'HOOK_END suite 2 beforeEach',
        'TEST_END test 0',
        'HOOK_END suite 2 afterEach',
        'HOOK_END suite 1 afterEach',
        'HOOK_END suite 2 after',
        'HOOK_END suite 1 after err'
      ]);
    });

    it('should run all hooks in case of nested after error', run => {
      const report = run(`
        describe('suite 1', () => {
          before(noop);
          after(noop);
          beforeEach(noop);
          afterEach(noop);
  
          describe('suite 2', () => {
            before(noop);
            after(() => { throw new Error('err') });
            beforeEach(noop);
            afterEach(noop);        
  
            it('test 0', noop);
          });
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before',
        'HOOK_END suite 2 before',
        'HOOK_END suite 1 beforeEach',
        'HOOK_END suite 2 beforeEach',
        'TEST_END test 0',
        'HOOK_END suite 2 afterEach',
        'HOOK_END suite 1 afterEach',
        'HOOK_END suite 2 after err',
        'HOOK_END suite 1 after'
      ]);
    });

  });

  describe('several hooks errors', () => {

    beforeEach(context => {
      context.runOptions.include = ['SUITE_END', 'HOOK_END', 'TEST_END'];
    });

    it('should keep first error in case of both before and after errors', run => {
      const report = run(`
        describe('suite 1', () => {
          before(() => { throw new Error('err1') });
          after(() => { throw new Error('err2') });

          it('test 0', noop);
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 before err1',
        'HOOK_END suite 1 after err2',
        'SUITE_END suite 1 err1',
        'SUITE_END root err1'
      ]);
    });

    it('should keep first error in case of both beforeEach and afterEach errors', run => {
      const report = run(`
        describe('suite 1', () => {
          beforeEach(() => { throw new Error('err1') });
          afterEach(() => { throw new Error('err2') });

          it('test 0', noop);
        });
      `);

      return expectResolve(report, [
        'HOOK_END suite 1 beforeEach err1',
        'HOOK_END suite 1 afterEach err2',
        'SUITE_END suite 1 err1',
        'SUITE_END root err1'
      ]);
    });

  });

});
