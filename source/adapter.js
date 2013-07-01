(function (global) {
  var Adapter = function Adapter() {
    var karma = Adapter.karma;
    var window = Adapter.window;

    var templateLoader = Adapter.TemplateLoader(karma, window);
    var cucumberRunner = Adapter.CucumberRunner(karma, window);

    var self = {
      start: function start() {
        templateLoader.loadHtml();
        cucumberRunner.initialize();
      },

      dump: function dump(value) {
        if (self.isAngularMockDumpAvailable()) {
          value = window.angular.mock.dump(value);
        }
        return value;
      },

      isAngularMockDumpAvailable: function isAngularMockDumpAvailable() {
        return (window &&
          window.angular &&
          window.angular.mock &&
          typeof window.angular.mock.dump === 'function') ? true:false;
      }
    };

    karma.start = self.start;
    karma.loaded = self.noop;
    window.dump = self.dump;

    return self;
  };

  define([
    './adapter/template_loader',
    './adapter/cucumber_runner'
  ], function (TemplateLoader, CucumberRunner) {
    Adapter.TemplateLoader = TemplateLoader;
    Adapter.CucumberRunner = CucumberRunner;

    Adapter.karma = global.__karma__;
    Adapter.window = global;

    return Adapter;
  });
}(window));








