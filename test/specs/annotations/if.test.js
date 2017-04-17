describe('annotation: if', () => {

  it('should exclude/include test for particular env', run => {
    const config = {
      createEnvs: function () {
        return [
          {id: 'env1'},
          {id: 'env2'},
        ];
      },
    };
    const result = run(`
      describe('suite 1', () => {
        it('test 0', noop);

        $if(env => env.id === 'env1');
        it('test 1', noop);

        $if(env => env.id !== 'env1');
        it('test 2', noop);
      });
    `, {config});

    return expectResolve(result, {
      env1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 1'
        ]
      },
      env2: {
        session1: [
          'TEST_END test 0',
          'TEST_END test 2'
        ]
      }
    });
  });

  it('should exclude/include suite for particular env', run => {
    const config = {
      createEnvs: function () {
        return [
          {id: 'env1'},
          {id: 'env2'},
        ];
      },
    };
    const result = run(`
      describe('suite 0', () => {
        it('test 0', noop);
      });
      
      $if(env => env.id === 'env1');
      describe('suite 1', () => {
        it('test 1', noop);
        it('test 2', noop);
      });

      $if(env => env.id !== 'env1');
      describe('suite 2', () => {
        it('test 3', noop);
        it('test 4', noop);
      });
    `, {config});

    return expectResolve(result, {
      env1: {
        session0: [
          'TEST_END test 0',
          'TEST_END test 1',
          'TEST_END test 2'
        ]
      },
      env2: {
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

    return expectReject(result, {
      message: '$if() should accept function as parameter'
    });
  });

});
