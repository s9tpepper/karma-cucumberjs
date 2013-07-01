(function (global) {
  var CucumberRunner = function CucumberRunner(karma, window) {
    var fileLoader = CucumberRunner.FileLoader(karma, window);

    var self = {
      // Reference to the context object created by CucumberJS with the API hooks (Given, When, Then, World, etc)
      // https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/support_code/library.js#L62
      supportCodeHelper: null,

      features: [],
      karmaFiles: karma.files,

      initialize: function initialize() {
        var featureFiles = self.getFeatureFilePaths();

        if (featureFiles && featureFiles.length) {
          featureFiles.forEach(self.loadFeature);
        } else {
          throw new Error("No .feature files were found in your Karma config. Please add some .feature files to your Karma configuration.");
        }
      },

      getFeatureFilePaths: function getFeatureFilePaths() {
        var featureFilesPaths = [];
        for (var filePath in self.karmaFiles) {
          if (filePath.match(/\.feature$/)) {
            featureFilesPaths.push(filePath);
          }
        }
        return featureFilesPaths;
      },

      loadFeature: function loadFeature(featureFilePath) {
        var fileContents = fileLoader.loadFile(featureFilePath);
        self.features.push([featureFilePath, fileContents]);
      },

      startCucumberRun: function startCucumberRun() {
        var cucumber = CucumberRunner.Cucumber(self.features, self.stepDefinitionsFunction);
        cucumber.attachListener(CucumberRunner.HtmlListener());
        cucumber.attachListener(CucumberRunner.KarmaListener(karma));
        cucumber.attachListener(CucumberRunner.Cucumber.Listener.PrettyFormatter({
          logToConsole: false,
          logToFunction: self.prettyFormatterLogger
        }));

        setTimeout(function () {
          cucumber.start(self.onCucumberFinished);
        }, 1);
      },

      stepDefinitionsFunction: function stepDefinitionsFunction() {
        self.supportCodeHelper = this;
        CucumberRunner.stepDefinitions.forEach(self.runStepDefinition);
      },

      runStepDefinition: function runStepDefinition(stepDefinition) {
        stepDefinition(self.supportCodeHelper);
      },

      prettyFormatterLogger: function prettyFormatterLogger(cucumberLog) {
        cucumberLog = cucumberLog.trim();
        cucumberLog = cucumberLog.split('\n');
        cucumberLog.forEach(self.log);
      },

      log: function log(message) {
        if (window.console && window.console.log) {
          window.console.log(message);
        }
      },

      onCucumberFinished: function onCucumberFinished() {
        karma.complete({});
      }
    };

    window.startCucumberRun = self.startCucumberRun;

    return self;
  };

  CucumberRunner.stepDefinitions = [];

  CucumberRunner.addStepDefinitions = function addStepDefinitions(stepDefinitionsFunction) {
    CucumberRunner.stepDefinitions.push(stepDefinitionsFunction);
  };
  window.addStepDefinitions = CucumberRunner.addStepDefinitions;

  define(['./file_loader', './cucumber_runner/html_listener', './cucumber_runner/karma_listener'], function (FileLoader, HtmlListener, KarmaListener) {
    CucumberRunner.FileLoader = FileLoader;
    CucumberRunner.HtmlListener = HtmlListener;
    CucumberRunner.KarmaListener = KarmaListener;

    CucumberRunner.global = global;
    CucumberRunner.Cucumber = global.Cucumber;

    return CucumberRunner;
  });
}(window));