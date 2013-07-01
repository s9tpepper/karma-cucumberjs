/**
 * Wrapper around cucumber-js to create a standard runner & reporter for client side testing of multiple features / step definitions
 * Initially the runner has the following reporters available: cucumber-html-reporter and
 * karma-cucumber for use with karma (http://karma-runner.github.com/)
 * Requires: async and jQuery
 */
(function () {
  "use strict";

  var my = {}, reporters = [], featureUrls = [], features = null, stepDefinitions = [],
    featuresToLoad = 0;

  /**
   * Load the features for the runner
   */
  var loadFeatures = function () {
    if (features !== null) {
      throw new Error("A load is already in progress");
    }

    featuresToLoad = featureUrls.length;
    features = [];
    async.each(featureUrls, function (url, callback) {
      $.get(url, function (text) {
        features.push([url, text]);
        featuresToLoad -= 1;
        callback();
      });

    }, function (err) {
      if (err)
        throw err;
      //run cucumber after all features are loaded
      //Cucumber.run(); // Disabled automatic-running of the Cukes ****************************************** - omar
    });
  };

  /**
   * Load the .feature definitions to test
   * @param {Array.<String>} urls
   */
  window.addFeatures = function (urls) {
    featureUrls = urls;
    loadFeatures();
  };

  /**
   * Add step definition functions for the features
   * @param {Function} func
   */
  window.addStepDefinitions = function (func) {
    stepDefinitions.push(func);
  };

  /**
   * Attach a reporter to the cucumber test runner
   * @param reporter
   */
  Cucumber.attachReporter = function (reporter) {
    reporters.push(reporter);
  };

  /**
   * Return the feature urls to run
   * @returns {Array}
   */
  Cucumber.featureUrls = function () {
    return featureUrls;
  };

  var callbacks = [];
  /**
   * Run the cucumber feature tests
   * @param callback Called when complete
   */
  Cucumber.run = function (callback) {
    if (callback) {
      callbacks.push(callback);
    }

    //reload the features if they are null
    if (features === null) {
      loadFeatures();
      return;
    }

    //wait to run until all features are loaded
    //after they are loaded, run will automatically be called again
    if (featuresToLoad > 0) {
      return;
    }

    //combine the step definitions into one function
    //since cucumber-js only accepts one set of definitions
    var stepDefinitionsSource = function () {
      var that = this;
      $.each(stepDefinitions, function (index, func) {
        func(that);
      });
    };

    //run cucumber-js for each feature
    var cucumber = Cucumber(features, stepDefinitionsSource);

    $.each(reporters, function (index, reporter) {
      //get the listener for a feature
      var listener = reporter.getListener(features);
      cucumber.attachListener(listener);
    });

    cucumber.start(function () {
      while (callbacks.length > 0) {
        callbacks.shift()();
      }
    });

    //forces a reload of features every time
    features = null;

    return my;
  };
})();