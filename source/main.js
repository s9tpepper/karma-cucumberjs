window.__karma__.loaded = function () {};
require(["adapter"], function (Adapter) {
  Adapter().start();
});