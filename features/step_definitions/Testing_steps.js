addStepDefinitions(function (scenario) {
  // Provide a custom World constructor. It's optional, a default one is supplied.
  scenario.World = function (callback) {
    callback();
  };



  // Define your World, here is where you can add some custom utlity functions you
  // want to use with your Cucumber step definitions, this is usually moved out
  // to its own file that you include in your Karma config
  var proto = scenario.World.prototype;
  proto.appSpecificUtilityFunction = function someHelperFunc() {
    // do some common stuff with your app
  };



  scenario.Before(function (callback) {
    // Use a custom utility function
    this.appSpecificUtilityFunction();

    callback();
  });




  var box;

  scenario.Given(/^the box in the page is green$/, function(callback) {
    box = $('.box');

    var boxColor = box.css('background-color');
    if (boxColor === 'rgb(0, 128, 0)') {
      callback();
    } else {
      callback.fail('The box was not green, Expected: ' + boxColor + ' to be "rgb(0, 128, 0)"');
    }
  });

  scenario.When(/^the user clicks on the box$/, function(callback) {
    box.click();
    callback();
  });

  scenario.Then(/^the box turns red$/, function(callback) {
    var boxColor = box.css('background-color');
    if (boxColor === 'rgb(255, 0, 0)') {
      callback();
    } else {
      callback.fail('The box was not red, Expected: ' + boxColor + ' to be "rgb(255, 0, 0)"');
    }
  });




  scenario.After(function (callback) {
    callback();
  });
});
