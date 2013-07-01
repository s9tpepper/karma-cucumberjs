(function($) {
  var FrameBrowser = function FrameBrowser(frameSelector) {
    var WAIT_FOR_TIMEOUT  = 5000;
    var WAIT_FOR_DELAY    = 20;
    var SAFETY_WAIT_DELAY = 20;

    var $frame           = jQuery(frameSelector);
    window.f = $frame;

    function waitFor(subject, test, callback, errCallback) {
      var start = new Date().getTime();

      function check() {
        var now     = new Date().getTime();
        var elapsed = now - start;
        if (test()) {
          callback();
        } else if (elapsed > WAIT_FOR_TIMEOUT) {
          var error = new Error("Timed out waiting for " + subject);
          if (errCallback)
            errCallback(error);
          else
            throw error;
        } else {
          setTimeout(function () { check(callback); }, WAIT_FOR_DELAY);
        }
      }
      check(test, callback);
    }

    function _visitUrl(url) {
      $frame.get()[0].contentWindow.stop(); // stop possible current loads
      if ($frame.attr('src') == url) {
        $frame.get()[0].contentWindow.location.reload();
      } else {
        $frame.attr('src', url);
      }
    }

    var self = {
      visitUrl: function (url) {
        return function visitUrl(callback) {
          _visitUrl(url);
          var state = $frame.get()[0].contentDocument.readyState;
          callback();
        };
      },

      fillIn: function (selector, value) {
        return function fillIn(callback) {
          self.waitForSelector(selector, function () {
            self.find(selector).val(value);
            callback();
          });
        };
      },

      clickLink: function (link) {
        return function clickLink(callback) {
          var selector = "a:contains('" + link.replace("'", "\\'") + "'):first";
          self.waitForSelector(selector, function () {
            var $a = self.find(selector);
            var href = $a.attr('href');
            $a.click();
            if (href)
              _visitUrl(href);
            callback();
          });
        };
      },

      clickButton: function (selector) {
        return function clickButton(callback) {
          self.waitForSelector(selector, function () {
            self.find(selector).click();
            callback();
          });
        };
      },

      waitForPageToLoad: function () {
        return function waitForPageToLoad(callback) {
          var previousUrl = $frame.get()[0].contentDocument.location.href;
          setTimeout(function () {
            waitFor(
              "page to load",
              function () {
                var state = $frame.get()[0].contentDocument.readyState;
                var currentUrl = $frame.get()[0].contentDocument.location.href;
                var isPageLoaded = state == 'complete' && currentUrl != previousUrl;
                return isPageLoaded;
              },
              callback
            );
          }, SAFETY_WAIT_DELAY); // TODO: remove this ugly hack
        };
      },

      assertBodyText: function (text) {
        return function assertBodyText(callback) {
          waitFor(
            "body text to contain " + text,
            function () {
              var bodyText      = $($frame.get()[0].contentDocument.body).text().replace(/\n\n/g, '\n');
              var isTextPresent = bodyText.indexOf(text) !== -1;
              return isTextPresent;
            },
            callback
          );
        };
      },

      // internals

      waitForSelector: function (selector, callback) {
        waitFor(
          "selector \"" + selector + "\"",
          function () {
            var elements = self.find(selector);
            var found    = elements.length > 0;
            return found;
          },
          callback
        );
      },

      find: function (selector) {
        var $elements = $frame.contents().find(selector);
        return $elements;
      }
    };
    return self;
  };

  var CucumberHTMLListener = function($root) {
    var CucumberHTML = window.CucumberHTML;
    var formatter    = new CucumberHTML.DOMFormatter($root);

    formatter.uri('report.feature');

    var currentStep;

    var self = {
      hear: function hear(event, callback) {
        var eventName = event.getName();
        switch (eventName) {
          case 'BeforeFeature':
            var feature = event.getPayloadItem('feature');
            formatter.feature({
              keyword     : feature.getKeyword(),
              name        : feature.getName(),
              line        : feature.getLine(),
              description : feature.getDescription()
            });
            break;

          case 'BeforeScenario':
            var scenario = event.getPayloadItem('scenario');
            formatter.scenario({
              keyword     : scenario.getKeyword(),
              name        : scenario.getName(),
              line        : scenario.getLine(),
              description : scenario.getDescription()
            });
            break;

          case 'BeforeStep':
            var step = event.getPayloadItem('step');
            self.handleAnyStep(step);
            break;

          case 'StepResult':
            var result;
            var stepResult = event.getPayloadItem('stepResult');
            if (stepResult.isSuccessful()) {
              result = {status: 'passed'};
            } else if (stepResult.isPending()) {
              result = {status: 'pending'};
            } else if (stepResult.isUndefined()) {
              result = {status: 'undefined'};
            } else if (stepResult.isSkipped()) {
              result = {status: 'skipped'};
            } else {
              var error = stepResult.getFailureException();
              var errorMessage = error.stack || error;
              result = {status: 'failed', error_message: errorMessage};
              displayError(error);
            }
            formatter.match({uri:'report.feature', step: {line: currentStep.getLine()}});
            formatter.result(result);
            break;

          case 'UndefinedStep':
          case 'SkippedStep':
            var step = event.getPayloadItem('step');
            self.handleAnyStep(step);
            formatter.match({uri:'report.feature', step: {line: step.getLine()}});
            formatter.result({status:'skipped'});
            break;
        }
        callback();
      },

      handleAnyStep: function handleAnyStep(step) {
        formatter.step({
          keyword     : step.getKeyword(),
          name        : step.getName(),
          line        : step.getLine(),
        });
        currentStep = step;
      }
    };
    return self;
  };

  window.CukeStall = { FrameBrowser: FrameBrowser };

  function runFeature() {
    var Cucumber        = window.Cucumber;
//    var output          = $('#output');

    $.ajax({
      url: $('script[type="text/x-gherkin"]')[0].src,
      success: function(result) {
//        if (result.isOk == false) {
//          alert(result.message);
//        }

        var featureSource   = result;

        var supportCode     = function () { window.supportCode.call(this); };
        var cucumber        = Cucumber(featureSource, supportCode);
        var $output         = $('#output');
        var listener        = CucumberHTMLListener($output);
        $output.empty();
        cucumber.attachListener(listener);

        resetErrors();
        try {
          var oldHandler = window.onerror;
          window.onerror = function(err) {
            displayError(err);
            window.onerror = oldHandler;
          };
          cucumber.start(function() { });
        } catch(err) {
          displayError(err);
          throw err;
        }
      },
      async: true
    });
  }

  function resetErrors() {
    var errors          = $('#errors');
    var errorsContainer = $('#errors-container');
    errors.text('');
    errorsContainer.hide();
  }

  function displayError(err) {
    var errors          = $('#errors');
    var errorsContainer = $('#errors-container');

    errorsContainer.show();
    var errMessage = err.stack || err.message || err;
    var buffer = (errors.text() == '' ? errMessage : errors.text() + "\n\n" + errMessage);
    errors.text(buffer);
  }

  $(function() {
    Gherkin = { Lexer: function() { return Lexer; } };
    $('#run').click(runFeature);
    $('#errors-container').hide();
  });
})(jQuery);