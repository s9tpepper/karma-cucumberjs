var tests = [], specMatcher = /spec\.js$/, file;

for (file in window.__karma__.files) {
  if (specMatcher.test(file)) {
    tests.push(file);
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',

  paths: {
  },

  shim: {
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});

requirejs.onError = function (err) {
  console.log(err.requireType);
  console.log('modules: ' + err.requireModules);
  throw err;
};
