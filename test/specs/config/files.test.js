describe('config.files', () => {

  it('should reject for empty config.files', run => {
    const config = {
      files: [],
    };
    const result = run([], {config});
    return expectReject(result, 'Empty config.files');
  });

  it('should reject for empty matched files', run => {
    const config = {
      files: ['abc'],
    };
    const result = run([], {config});
    return expectReject(result, 'No files matched');
  });

  it('should reject for invalid files', run => {
    const config = {
      files: [123],
    };
    const result = run([], {config});
    return expectReject(result, 'Files should be array of String or Object {name, content}, got 123');
  });

  it('should process file as object', run => {
    const config = {
      files: [{
        name: 'test.js',
        content: `
          describe('suite 1', () => {
            it('test 1', noop);
          });`
      }],
    };
    const result = run([], {config});
    return expectResolve(result, ['TEST_END test 1']);
  });

  // $if(() => typeof process === 'object' && process.versions && process.versions.node);
  describe('node', () => {
    it('should process file as path', run => {
      const config = {files: ['test/data/test.js']};
      const result = run([], {config});
      return expectResolve(result, ['TEST_END test 1']);
    });

    it('should process directory (without slash)', run => {
      const config = {files: 'test/data/subdir1'};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process directory (with slash)', run => {
      const config = {files: ['test/data/subdir2/']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process pattern *.js', run => {
      const config = {files: ['test/data/subdir3/*.js']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });

    it('should process pattern **', run => {
      const config = {files: ['test/data/subdir4/**']};
      const result = run([], {config});
      return expectResolve(result, [
        'TEST_END test 1',
        'TEST_END test 2'
      ]);
    });
  });

  xdescribe('browser', () => {
    xit('should process file as url', () => {});
  });

});
