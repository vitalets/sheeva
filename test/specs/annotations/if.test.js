describe('annotation: if', () => {

  it('should exclude/include test for particular target', run => {
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);

        $if(target => target.id === 'target1');
        it('test 1', noop);

        $if(target => target.id !== 'target1');
        it('test 2', noop);
      });
    `, {config});

    return expectResolve(result, {
      target1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 1'
        ]
      },
      target2: {
        session1: [
          'TEST_END test 0',
          'TEST_END test 2'
        ]
      }
    });
  });

  it('should exclude/include suite for particular target', run => {
    const config = {
      createTargets: function () {
        return [
          {id: 'target1'},
          {id: 'target2'},
        ];
      },
    };
    const result = run(`
      describe('suite 0', () => {
        it('test 0', noop);
      });
      
      $if(target => target.id === 'target1');
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });

      $if(target => target.id !== 'target1');
      describe('suite 2', () => {
        it('test 3', noop);
        it('test 4', noop);
      });
    `, {config});

    return expectResolve(result, {
      target1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 1',
          'TEST_END test 2'
        ]
      },
      target2: {
        session1: [
          'TEST_END test 0',
          'TEST_END test 3',
          'TEST_END test 4',
        ]
      }
    });
  });

  it('should throw error if not fn passed to $ignore', run => {
    const result = run(`
      $if(123); 
      describe('suite 0', () => {
        it('test 0', noop);
      });
    `);

    return expectReject(result, '$if() should accept function as parameter');
  });

});
