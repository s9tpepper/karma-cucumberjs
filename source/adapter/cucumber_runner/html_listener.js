(function (global) {
  var HtmlListener = function HtmlListener() {
    var $ = HtmlListener.$, domFormatter;

    var self = {
      output: null,
      domFormatterFeatureReport: null,
      cucumberHtmlReporter: null,
      cucumberJsHtmlReport: null,
      eventMap: null,
      currentStep: null,

      hear: function hear(event, callback) {
        if (!self.eventMap) {
          self.eventMap = {
            'BeforeFeature': self.beforeFeature,
            'BeforeScenario': self.beforeScenario,
            'BeforeStep': self.beforeStep,
            'StepResult': self.stepResult
          };
        }

        var eventName = event.getName();

        // Some event names are not handled, those throw
        try {
          self.eventMap[eventName](event);
        } catch (e) {}

        callback();
      },

      beforeFeature: function beforeFeature(event) {
        var feature = event.getPayloadItem('feature');
        var featureData = {
          keyword: feature.getKeyword(),
          name: feature.getName(),
          line: feature.getLine(),
          description: feature.getDescription()
        };
        domFormatter.feature(featureData);
      },

      beforeScenario: function beforeScenario(event) {
        var scenario = event.getPayloadItem('scenario');
        var scenarioData = {
          keyword: scenario.getKeyword(),
          name: scenario.getName(),
          line: scenario.getLine(),
          description: scenario.getDescription()
        };
        domFormatter.scenario(scenarioData);
      },

      beforeStep: function beforeStep(event) {
        var step = event.getPayloadItem('step');
        self.currentStep = step;
        var stepData = {
          keyword: step.getKeyword(),
          name: step.getName(),
          line: step.getLine()
        };
        domFormatter.step(stepData);
      },

      stepResult: function stepResult(event) {
        var result = event.getPayloadItem('stepResult');

        var currentLine = self.currentStep.getLine();
        domFormatter.match({uri: HtmlListener.URI, step: {line: currentLine}});

        var update = {};
        if (result.isSuccessful()) {
          update.status = 'passed';
        } else if (result.isPending()) {
          update.status = 'pending';
        } else if (result.isUndefined() || result.isSkipped()) {
          update.status = 'skipped';
        } else {
          var error = result.getFailureException();
          update.status = 'failed';
          update.error_message = error.stack || error;
        }
        domFormatter.result(update);
      }
    };

    self.output                     = $(HtmlListener.OUTPUT_TEMPLATE);
    self.domFormatterFeatureReport  = $(HtmlListener.DOM_FORMATTER_REPORT_TEMPLATE);
    self.cucumberHtmlReporter       = $(HtmlListener.CUCUMBER_HTML_REPORTER_DIV_SELECTOR);
    self.cucumberJsHtmlReport       = $(HtmlListener.CUCUMBER_HTML_REPORT_TEMPLATE);

    self.cucumberJsHtmlReport.appendTo(self.cucumberHtmlReporter);
    self.output.appendTo(self.cucumberHtmlReporter);
    self.output.append(self.domFormatterFeatureReport);

    domFormatter = new HtmlListener.CucumberHTML.DOMFormatter(self.domFormatterFeatureReport);
    domFormatter.uri(HtmlListener.URI);

    return self;
  };

  HtmlListener.OUTPUT_TEMPLATE                      = '<div id=\'output\' class=\'cucumber-report\'></div>';
  HtmlListener.DOM_FORMATTER_REPORT_TEMPLATE        = '<div></div>';
  HtmlListener.CUCUMBER_HTML_REPORTER_DIV_SELECTOR  = '#cucumber_html_reporter';
  HtmlListener.CUCUMBER_HTML_REPORT_TEMPLATE        = '<div id=\'CucumberJsHtmlReport\'></div>';
  HtmlListener.URI                                  = 'report.feature';

  define([], function () {
    HtmlListener.$ = global.jQuery;
    HtmlListener.CucumberHTML = global.CucumberHTML;

    return HtmlListener;
  });

}(window));