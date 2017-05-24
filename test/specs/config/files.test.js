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

  xit('should process file as path', run => {});
  xit('should process file as pattern', run => {});
  xit('should process file as url', run => {});

});
