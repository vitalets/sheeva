/**
 * Files reader for browser (via script tag)
 */

exports.isAsync = true;
exports.matchFile = function (str) {
  const isPattern = str.indexOf('*') >= 0;
  if (isPattern) {
    throw new Error('File patterns are not allowed in browser');
  }
  return [str];
};

exports.executeFile = function (url) {
  return typeof window !== 'undefined' ? loadInScriptTag(url) : loadInWebWorker(url);
};

function loadInScriptTag(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`The script at '${url}' failed to load.`));
    script.src = url + '?' + Date.now();
    document.getElementsByTagName('head')[0].appendChild(script);
  });
}

function loadInWebWorker(url) {
  return new Promise(resolve => {
    importScripts(url);
    resolve();
  });
}
