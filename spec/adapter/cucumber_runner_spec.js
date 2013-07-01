define(['source/adapter/cucumber_runner', 'spec/support/helper'], function (CucumberRunner, helper) {
  describe('CucumberRunner()', function () {
    var cucumberRunner, karma, window, fileLoader, cucumber, htmlListener, karmaListener, prettyFormatter;

    beforeEach(function () {
      karma = helper.createSpyWithStubs('karma', {complete: null});

      //array of available files configured in the karma conf
      karma.files = [];

      window = helper.createSpyWithStubs('window', {});

      CucumberRunner.FileLoader = jasmine.createSpy('FileLoader');
      fileLoader = helper.createSpyWithStubs('file loader', {loadFile: null});
      CucumberRunner.FileLoader.andReturn(fileLoader);

      CucumberRunner.Cucumber = helper.createSpyWithStubs('Cucumber', {});
      cucumber = helper.createSpyWithStubs('cucumber instance', {attachListener: null, start: null});
      CucumberRunner.Cucumber.andReturn(cucumber);

      CucumberRunner.Cucumber.Listener = helper.createSpyWithStubs("Listener", {});

      CucumberRunner.Cucumber.Listener.PrettyFormatter = helper.createSpyWithStubs("PrettyFormatter", {});
      prettyFormatter = helper.createSpyWithStubs("pretty formatter instance", {});
      CucumberRunner.Cucumber.Listener.PrettyFormatter.andReturn(prettyFormatter);

      CucumberRunner.HtmlListener = helper.createSpyWithStubs('HtmlListener', {});
      htmlListener = helper.createSpyWithStubs('html listener instance', {});
      CucumberRunner.HtmlListener.andReturn(htmlListener);

      CucumberRunner.KarmaListener = helper.createSpyWithStubs('KarmaListener', {});
      karmaListener = helper.createSpyWithStubs('karma listener instance', {});
      CucumberRunner.KarmaListener.andReturn(karmaListener);

      CucumberRunner.global = 'closure global';

      cucumberRunner = CucumberRunner(karma, window);
    });

    describe('static members', function () {
      beforeEach(function () {
      });

      it('sets the stepDefinitions list to empty', function () {
        expect(CucumberRunner.stepDefinitions).toEqual([]);
      });

      xit('sets the addStepDefinitions function to the global object', function () {
        expect(window.addStepDefinitions).toBeAnInstanceOf(Function);
      });

      describe('CucumberRunner.addStepDefinitions()', function () {
        var stepDefsFunction;
        beforeEach(function () {
          cucumberRunner.stepDefinitions = [];
          stepDefsFunction = function () {};
        });

        it('adds the step definitions function specified to the list of step definitions', function () {
          CucumberRunner.addStepDefinitions(stepDefsFunction);

          expect(CucumberRunner.stepDefinitions).toEqual([stepDefsFunction]);
        });
      });
    });

    describe('constructor', function () {
      it('sets the features for Cucumber to empty', function () {
        expect(cucumberRunner.features).toEqual([]);
      });

      it('sets the karmaFiles property to the files array from Karma', function () {
        expect(cucumberRunner.karmaFiles).toEqual(karma.files);
      });

      it('starts a FileLoader object so it can find files', function () {
        expect(CucumberRunner.FileLoader).toHaveBeenCalledWith(karma, window);
      });

      it('adds the addStepDefinitions method to the global scope so it is available to step definition scripts', function () {
        expect(window.addStepDefinitions).toBe(cucumberRunner.addStepDefinitions);
      });

      it('adds the startCucumberRun method to the global scope so it can be started once the app test fixture is ready', function () {
        expect(window.startCucumberRun).toBe(cucumberRunner.startCucumberRun);
      });
    });

    describe('initialize()', function () {
      var featureFiles;

      beforeEach(function () {
        spyOn(cucumberRunner, "getFeatureFilePaths");
        featureFiles = ["/path/to/file.feature"];
        cucumberRunner.getFeatureFilePaths.andReturn(featureFiles);
      });

      it('gets the feature files from Karma', function () {
        cucumberRunner.initialize();

        expect(cucumberRunner.getFeatureFilePaths).toHaveBeenCalled();
      });

      describe('when there are no feature files', function () {
        beforeEach(function () {
          featureFiles = [];
          cucumberRunner.getFeatureFilePaths.andReturn(featureFiles);
        });

        it('throws an error notifying that no feature files have been found', function () {
          expect(function () {
            cucumberRunner.initialize();
          }).toThrow("No .feature files were found in your Karma config. Please add some .feature files to your Karma configuration.");
        });
      });

      describe('when there are feature files found', function () {
        beforeEach(function () {
          featureFiles = [
            "/path/to/file1.feature",
            "/path/to/file2.feature"
          ];
          featureFiles.forEach = jasmine.createSpy("forEach()");
          cucumberRunner.getFeatureFilePaths.andReturn(featureFiles);
        });

        it('loads the contents of each feature file', function () {
          cucumberRunner.initialize();

          expect(featureFiles.forEach).toHaveBeenCalledWith(cucumberRunner.loadFeature);
        });
      });
    });

    describe('getFeatureFilePaths()', function () {
      var featureFiles;
      beforeEach(function () {
        featureFiles = {
          '/path/to/file1.feature': '134235436346',
          '/path/to/file.js': '17348297422',
          '/path/to/file2.feature': '2349082530'
        };
        cucumberRunner.karmaFiles = featureFiles;
      });

      it('returns an Array', function () {
        var paths = cucumberRunner.getFeatureFilePaths();

        expect(paths).toBeAnInstanceOf(Array);
      });

      describe('when there are files ending with .feature in the karma files', function () {
        it('returns an array with the .feature files', function () {
          var featureFilePaths = cucumberRunner.getFeatureFilePaths();

          var expectedFoundFeatureFiles = ["/path/to/file1.feature", "/path/to/file2.feature"];
          expect(featureFilePaths).toEqual(expectedFoundFeatureFiles);
        });
      });

      describe('when there are no files ending with .feature in the karma files', function () {
        beforeEach(function () {
          featureFiles = ["/path/to/file1.css", "/path/to/file.js", "/path/to/file2.js"];
          cucumberRunner.karmaFiles = featureFiles;
        });

        it('returns an empty array', function () {
          var featureFilePaths = cucumberRunner.getFeatureFilePaths();

          expect(featureFilePaths).toEqual([]);
        });
      });
    });

    describe('loadFeature()', function () {
      var featureFilePath, featureFileContents;

      beforeEach(function () {
        cucumberRunner.features = [];
        featureFilePath = '/path/to/feature/file.feature';
        featureFileContents = 'contents of the loaded feature file';

        fileLoader.loadFile.andReturn(featureFileContents);
      });

      it('loads the file content', function () {
        cucumberRunner.loadFeature(featureFilePath);

        expect(fileLoader.loadFile).toHaveBeenCalledWith(featureFilePath);
      });

      it('adds the feature file to the features list', function () {
        cucumberRunner.loadFeature(featureFilePath);

        var expectedFeaturesList = [[featureFilePath, featureFileContents]];
        expect(cucumberRunner.features).toEqual(expectedFeaturesList);
      });
    });

    describe('startCucumberRun()', function () {
      it('starts a Cucumber with the loaded features and step definitions', function () {
        cucumberRunner.startCucumberRun();

        expect(CucumberRunner.Cucumber).toHaveBeenCalledWith(cucumberRunner.features, cucumberRunner.stepDefinitionsFunction)
      });

      it('starts an HtmlListener to add to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        expect(CucumberRunner.HtmlListener).toHaveBeenCalled();
      });

      it('adds the HtmlListener to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        expect(cucumber.attachListener).toHaveBeenCalledWith(htmlListener);
      });

      it('starts a KarmaListener to add to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        expect(CucumberRunner.KarmaListener).toHaveBeenCalledWith(karma);
      });

      it('adds the KarmaListener to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        expect(cucumber.attachListener).toHaveBeenCalledWith(karmaListener);
      });

      it('starts a PrettyFormatter to add to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        var expectedPrettyFormatterConfig = {
          logToConsole: false,
          logToFunction: cucumberRunner.prettyFormatterLogger
        };
        expect(CucumberRunner.Cucumber.Listener.PrettyFormatter).toHaveBeenCalledWith(expectedPrettyFormatterConfig);
      });

      it('adds the PrettyFormatter to Cucumber', function () {
        cucumberRunner.startCucumberRun();

        expect(cucumber.attachListener).toHaveBeenCalledWith(prettyFormatter);
      });

      // TODO: Figure out a solution to remove the need for this delay
      it('tells cucumber to start running the features after delaying for a ms so step defs finish registering', function () {
        jasmine.Clock.useMock();

        cucumberRunner.startCucumberRun();

        jasmine.Clock.tick(1);

        expect(cucumber.start).toHaveBeenCalledWith(cucumberRunner.onCucumberFinished);
      });
    });

    describe('stepDefinitionsFunction()', function () {
      beforeEach(function () {
        CucumberRunner.stepDefinitions = [];
        CucumberRunner.stepDefinitions.forEach = jasmine.createSpy('stepDefinitions.forEach');
      });

      it('stores a reference to the Object caller which is an object created by CucumberJS with API hooks', function () {
        cucumberRunner.stepDefinitionsFunction();

        // Here it is 'cucumberRunner' because the stepDefinitionsFunction() is invoked by cucumberRunner
        // At run time the stepDefinitionsFunction is invoked using stepDefinitionsFunction.call(supportCodeHelper);
        // The supportCodeHelper contains the Given, When, Then, World, etc methods for the step defs
        // https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/support_code/library.js#L62
        expect(cucumberRunner.supportCodeHelper).toBe(cucumberRunner);
      });

      it('runs each of the step definitions that have been specified', function () {
        cucumberRunner.stepDefinitionsFunction();

        expect(CucumberRunner.stepDefinitions.forEach).toHaveBeenCalledWith(cucumberRunner.runStepDefinition);
      });
    });

    describe('runStepDefinition()', function () {
      var stepDefinition;

      beforeEach(function () {
        cucumberRunner.supportCodeHelper = 'cucumberjs supportCodeHelper object';
        stepDefinition = jasmine.createSpy('step definition function');
      });

      it('invokes the step definition with the supportCodeHelper reference', function () {
        cucumberRunner.runStepDefinition(stepDefinition);

        expect(stepDefinition).toHaveBeenCalledWith(cucumberRunner.supportCodeHelper);
      });
    });

    describe('prettyFormatterLogger()', function () {
      var cucumberLog, splitLog;

      beforeEach(function () {
        splitLog = ['log part one', 'log part two'];
        splitLog.forEach = jasmine.createSpy('splitLog.forEach');
        cucumberLog = helper.createSpyWithStubs('a log entry from cucumber', {trim: null, split: splitLog});
        cucumberLog.trim.andReturn(cucumberLog);
      });

      it('trims the cucumber log entry', function () {
        cucumberRunner.prettyFormatterLogger(cucumberLog);

        expect(cucumberLog.trim).toHaveBeenCalled();
      });

      it('splits the log by \n for any line breaks that the cucumber log has', function () {
        cucumberRunner.prettyFormatterLogger(cucumberLog);

        expect(cucumberLog.split).toHaveBeenCalledWith('\n');
      });

      it('logs each part of the cucumber log received', function () {
        cucumberRunner.prettyFormatterLogger(cucumberLog);

        expect(splitLog.forEach).toHaveBeenCalledWith(cucumberRunner.log);
      });
    });

    describe('log()', function () {
      var msg;

      beforeEach(function () {
        msg = 'a string message to log';
      });

      describe('when there is a console object on the window with a log method', function () {
        beforeEach(function () {
          window.console = {
            log: jasmine.createSpy('console.log')
          };
        });

        it('logs the message to the console log', function () {
          cucumberRunner.log(msg);

          expect(window.console.log).toHaveBeenCalledWith(msg);
        });
      });

      describe('when there is no log method on the console object', function () {
        beforeEach(function () {
          window.console = {};
        });

        it('does not throw an error', function () {
          expect(function () {
            cucumberRunner.log(msg);
          }).not.toThrow();
        });
      });

      describe('when there is no console object', function () {
        beforeEach(function () {
          delete window.console;
        });

        it('does not throw an error', function () {
          expect(function () {
            cucumberRunner.log(msg);
          }).not.toThrow();
        });
      });
    });

    describe('onCucumberFinished()', function () {
      it('tells karma that the Cucumber run is over', function () {
        cucumberRunner.onCucumberFinished();

        expect(karma.complete).toHaveBeenCalledWith({});
      });
    });
  });
});