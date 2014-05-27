(function (global) {
  global.__karma__.loaded = function () {};

  require(["adapter"], function (Adapter) {
    Adapter().start();
  });
})(window);
