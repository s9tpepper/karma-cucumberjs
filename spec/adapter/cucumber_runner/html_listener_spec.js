define(['source/adapter/cucumber_runner/html_listener', 'spec/support/helper'], function (HtmlListener, helper) {
  describe('HtmlListener()', function () {
    var htmlListener, jQuery, $output, $domFormatterFeatureReport,
      $cucumberHtmlReporterDiv, $cucumberJsHtmlReport, domFormatter;

    beforeEach(function () {
      jQuery = helper.createSpyWithStubs('jQuery', {});

      $output = helper.createSpyWithStubs('output jquery object', {append: null, appendTo: null});
      $domFormatterFeatureReport = helper.createSpyWithStubs('domFormatterFeatureReport jquery object', {});
      $cucumberHtmlReporterDiv = helper.createSpyWithStubs('cucumberHtmlReporterDiv jquery object', {});
      $cucumberJsHtmlReport = helper.createSpyWithStubs('cucumberJsHtmlReport jquery object', {appendTo: null});

      jQuery.andReturnSeveral([$output, $domFormatterFeatureReport, $cucumberHtmlReporterDiv, $cucumberJsHtmlReport]);
      HtmlListener.$ = jQuery;

      HtmlListener.CucumberHTML = jasmine.createSpy('CucumberHTML');
      HtmlListener.CucumberHTML.DOMFormatter = jasmine.createSpy('DOMFormatter');

      domFormatter = helper.createSpyWithStubs('dom formatter instance', {
        uri: null,
        feature: null,
        scenario: null,
        step: null,
        match: null,
        result: null
      });
      HtmlListener.CucumberHTML.DOMFormatter.andReturn(domFormatter);

      htmlListener = HtmlListener();
    });

    describe('constructor', function () {
      it('creates an output div for the cucumber reporting', function () {
        expect(jQuery).toHaveBeenCalledWith(HtmlListener.OUTPUT_TEMPLATE);
      });

      it('sets the output property to reference the output jQuery object', function () {
        expect(htmlListener.output).toBe($output);
      });

      it('creates an empty feature report div for the dom formatter', function () {
        expect(jQuery).toHaveBeenCalledWith(HtmlListener.DOM_FORMATTER_REPORT_TEMPLATE);
      });

      it('sets the domFormatterFeatureReport property to reference the domFormatterReportTemplate jQuery object', function () {
        expect(htmlListener.domFormatterFeatureReport).toBe($domFormatterFeatureReport);
      });

      it('gets a jQuery reference to the cucumber html reporter div', function () {
        expect(jQuery).toHaveBeenCalledWith(HtmlListener.CUCUMBER_HTML_REPORTER_DIV_SELECTOR);
      });

      it('sets the cucumberHtmlReporter property to reference the cucumberHtmlReporterDiv jQuery object', function () {
        expect(htmlListener.cucumberHtmlReporter).toBe($cucumberHtmlReporterDiv);
      });

      it('creates a CucumberJsHtmlReport div', function () {
        expect(jQuery).toHaveBeenCalledWith(HtmlListener.CUCUMBER_HTML_REPORT_TEMPLATE);
      });

      it('sets the cucumberJsHtmlReport property to reference the cucumberJsHtmlReport jQuery object', function () {
        expect(htmlListener.cucumberJsHtmlReport).toBe($cucumberJsHtmlReport);
      });

      it('appends the cucumberjs html report to the cucumber html reporter div', function () {
        expect($cucumberJsHtmlReport.appendTo).toHaveBeenCalledWith($cucumberHtmlReporterDiv);
      });

      it('appends the output div to the cucumter html reporter div', function () {
        expect($output.appendTo).toHaveBeenCalledWith($cucumberHtmlReporterDiv);
      });

      it('appends the feature report to the output div', function () {
        expect($output.append).toHaveBeenCalledWith($domFormatterFeatureReport);
      });

      it('starts a DOMFormatter', function () {
        expect(HtmlListener.CucumberHTML.DOMFormatter).toHaveBeenCalledWith($domFormatterFeatureReport);
      });

      it('sets the dom formatter uri property to "report.feature"', function () {
        expect(domFormatter.uri).toHaveBeenCalledWith('report.feature');
      });

      it('returns an object with a "hear" function', function () {
        expect(htmlListener.hear).toBeAnInstanceOf(Function);
      });
    });

    describe('hear()', function () {
      var event, callback;

      beforeEach(function () {
        event = helper.createSpyWithStubs('cucumberjs event', {getName: null});
        spyOn(htmlListener, 'beforeFeature');

        callback = helper.createSpyWithStubs('cucumberjs callback', {});
      });

      it('gets the event name', function () {
        htmlListener.hear(event, callback);

        expect(event.getName).toHaveBeenCalled();
      });

      describe('when the event name is "BeforeFeature"', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeFeature');
        });

        it('handles the BeforeFeature event with the beforeFeature method', function () {
          htmlListener.hear(event, callback);

          expect(htmlListener.beforeFeature).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is "BeforeScenario"', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeScenario');

          spyOn(htmlListener, 'beforeScenario');
        });

        it('handles the BeforeScenario event with the beforeScenario method', function () {
          htmlListener.hear(event, callback);

          expect(htmlListener.beforeScenario).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is "BeforeStep"', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeStep');

          spyOn(htmlListener, 'beforeStep');
        });

        it('handles the BeforeStep event with the beforeStep method', function () {
          htmlListener.hear(event, callback);

          expect(htmlListener.beforeStep).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is "StepResult"', function () {
        beforeEach(function () {
          event.getName.andReturn('StepResult');

          spyOn(htmlListener, 'stepResult');
        });

        it('handles the StepResult event with the stepResult method', function () {
          htmlListener.hear(event, callback);

          expect(htmlListener.stepResult).toHaveBeenCalledWith(event);
        });
      });

      it('invokes the callback so that CucumberJS can move on', function () {
        htmlListener.hear(event, callback);

        expect(callback).toHaveBeenCalled();
      });
    });

    describe('beforeFeature()', function () {
      var event, callback, feature;

      beforeEach(function () {
        feature = helper.createSpyWithStubs('feature', {
          getKeyword: 'feature keyword',
          getName: 'feature name',
          getLine: 'feature line',
          getDescription: 'feature description'
        });
        event = helper.createSpyWithStubs('cucumberjs event', {getPayloadItem: null});
        event.getPayloadItem.andReturn(feature);

        callback = helper.createSpyWithStubs('cucumberjs callback', {});
      });

      it('gets the feature payload item from the cucumberjs event', function () {
        htmlListener.beforeFeature(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
      });

      it('gets the feature keyword from the payload item', function () {
        htmlListener.beforeFeature(event);

        expect(feature.getKeyword).toHaveBeenCalled();
      });

      it('gets the feature name from the payload item', function () {
        htmlListener.beforeFeature(event);

        expect(feature.getName).toHaveBeenCalled();
      });

      it('gets the feature line from the payload item', function () {
        htmlListener.beforeFeature(event);

        expect(feature.getLine).toHaveBeenCalled();
      });

      it('gets the feature description from the payload item', function () {
        htmlListener.beforeFeature(event);

        expect(feature.getDescription).toHaveBeenCalled();
      });

      it('tells the DOMFormatter about the feature', function () {
        htmlListener.beforeFeature(event);

        var featureData = {
          keyword: 'feature keyword',
          name: 'feature name',
          line: 'feature line',
          description: 'feature description'
        };
        expect(domFormatter.feature).toHaveBeenCalledWith(featureData);
      });
    });

    describe('beforeScenario()', function () {
      var event, callback, scenario;

      beforeEach(function () {
        scenario = helper.createSpyWithStubs('scenario', {
          getKeyword: 'scenario keyword',
          getName: 'scenario name',
          getLine: 'scenario line',
          getDescription: 'scenario description'
        });
        event = helper.createSpyWithStubs('cucumberjs event', {getPayloadItem: null});
        event.getPayloadItem.andReturn(scenario);

        callback = helper.createSpyWithStubs('cucumberjs callback', {});
      });

      it('gets the scenario payload item from the cucumberjs event', function () {
        htmlListener.beforeScenario(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it('gets the scenario keyword from the payload item', function () {
        htmlListener.beforeScenario(event);

        expect(scenario.getKeyword).toHaveBeenCalled();
      });

      it('gets the scenario name from the payload item', function () {
        htmlListener.beforeScenario(event);

        expect(scenario.getName).toHaveBeenCalled();
      });

      it('gets the scenario line from the payload item', function () {
        htmlListener.beforeScenario(event);

        expect(scenario.getLine).toHaveBeenCalled();
      });

      it('gets the scenario description from the payload item', function () {
        htmlListener.beforeScenario(event);

        expect(scenario.getDescription).toHaveBeenCalled();
      });

      it('tells the DOMFormatter about the scenario', function () {
        htmlListener.beforeScenario(event);

        var scenarioData = {
          keyword: 'scenario keyword',
          name: 'scenario name',
          line: 'scenario line',
          description: 'scenario description'
        };
        expect(domFormatter.scenario).toHaveBeenCalledWith(scenarioData);
      });
    });

    describe('beforeStep()', function () {
      var event, step;

      beforeEach(function () {
        step = helper.createSpyWithStubs('step', {
          getKeyword: 'step keyword',
          getName: 'step name',
          getLine: 'step line'
        });
        event = helper.createSpyWithStubs('cucumberjs event', {getPayloadItem: null});
        event.getPayloadItem.andReturn(step);
      });

      it('gets the step payload item', function () {
        htmlListener.beforeStep(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('step');
      });

      it('sets the currentStep property to the step item', function () {
        htmlListener.beforeStep(event);

        expect(htmlListener.currentStep).toBe(step);
      });

      it('gets the step keyword from the payload item', function () {
        htmlListener.beforeStep(event);

        expect(step.getKeyword).toHaveBeenCalled();
      });

      it('gets the step name from the payload item', function () {
        htmlListener.beforeStep(event);

        expect(step.getName).toHaveBeenCalled();
      });

      it('gets the step line from the payload item', function () {
        htmlListener.beforeStep(event);

        expect(step.getLine).toHaveBeenCalled();
      });

      it('tells the DOMFormatter about the step', function () {
        htmlListener.beforeStep(event);

        var stepData = {
          keyword: 'step keyword',
          name: 'step name',
          line: 'step line'
        };
        expect(domFormatter.step).toHaveBeenCalledWith(stepData);
      });
    });

    describe('stepResult()', function () {
      var event, stepResult, currentStepLine;

      beforeEach(function () {
        currentStepLine = 'the current step feature file line';
        stepResult = helper.createSpyWithStubs('step result object', {
          isSuccessful: false,
          isPending: false,
          isUndefined: false,
          isSkipped: false,
          getFailureException: 'error object'
        });
        event = helper.createSpyWithStubs('event', {getPayloadItem: stepResult});
        htmlListener.currentStep = helper.createSpyWithStubs('current step', {getLine: currentStepLine});
      });

      it('gets the stepResult payload item from the event', function () {
        htmlListener.stepResult(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
      });

      it('gets the current step line', function () {
        htmlListener.stepResult(event);

        expect(htmlListener.currentStep.getLine).toHaveBeenCalled();
      });

      it('tells the DOMFormatter to match the line', function () {
        htmlListener.stepResult(event);

        var matchInfo = {
          uri: 'report.feature',
          step: {
            line: currentStepLine
          }
        };
        expect(domFormatter.match).toHaveBeenCalledWith(matchInfo);
      });

      it('tells the DOMFormatter about the result', function () {
        htmlListener.stepResult(event);

        expect(domFormatter.result).toHaveBeenCalledWithInstanceOfConstructorAsNthParameter(Object, 1);
      });

      describe('when the stepResult was successful', function () {
        beforeEach(function () {
          stepResult.isSuccessful.andReturn(true);
        });

        it('tells the DOMFormatter that the result was a pass', function () {
          htmlListener.stepResult(event);

          expect(domFormatter.result).toHaveBeenCalledWith({status: 'passed'});
        });
      });

      describe('when the stepResult is pending', function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
        });

        it('tells the DOMFormatter that the result is pending', function () {
          htmlListener.stepResult(event);

          expect(domFormatter.result).toHaveBeenCalledWith({status: 'pending'});
        });
      });

      describe('when the stepResult is undefined', function () {
        beforeEach(function () {
          stepResult.isUndefined.andReturn(true);
        });

        it('tells the DOMFormatter that the result is skipped', function () {
          htmlListener.stepResult(event);

          expect(domFormatter.result).toHaveBeenCalledWith({status: 'skipped'});
        });
      });

      describe('when the stepResult is skipped', function () {
        beforeEach(function () {
          stepResult.isSkipped.andReturn(true);
        });

        it('tells the DOMFormatter that the result is skipped', function () {
          htmlListener.stepResult(event);

          expect(domFormatter.result).toHaveBeenCalledWith({status: 'skipped'});
        });
      });

      describe('when the stepResult is not skipped, undefined, pending or passed', function () {
        beforeEach(function () {
          stepResult.isSkipped.andReturn(false);
          stepResult.isUndefined.andReturn(false);
          stepResult.isPending.andReturn(false);
          stepResult.isSuccessful.andReturn(false);
        });

        it('gets the failure exception from the step result', function () {
          htmlListener.stepResult(event);

          expect(stepResult.getFailureException).toHaveBeenCalled();
        });

        describe('when the error has a stack trace', function () {
          var error;

          beforeEach(function () {
            error = {
              stack: 'a stack trace'
            };

            stepResult.getFailureException.andReturn(error);
          });

          it('tells the DOMFormatter about the failure using the stack trace', function () {
            htmlListener.stepResult(event);

            expect(domFormatter.result).toHaveBeenCalledWith({status: 'failed', error_message: 'a stack trace'});
          });
        });

        describe('when the error does not have a stack trace', function () {
          var error;

          beforeEach(function () {
            error = 'an error object';
            stepResult.getFailureException.andReturn(error);
          });

          it('tells the DOMFormatter about the failure using the stack trace', function () {
            htmlListener.stepResult(event);

            expect(domFormatter.result).toHaveBeenCalledWith({status: 'failed', error_message: 'an error object'});
          });
        });
      });
    });
  });
});