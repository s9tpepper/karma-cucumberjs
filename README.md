#karma-cucumberjs

Run your Cucumber.js suite using Karma runner.

##Getting Started
```Shell
npm install karma-cucumberjs --save-dev
```
Once you install the karma-cucumberjs adapter getting it working with your project is a matter of editing your Karma config file.

###Config
The adapter requires that the files array in the karma config contain the files it will require to run your Cucumber feature suite. The adapter looks for the following files:
- Cucumber reporter CSS
- HTML/JS app template
- feature files
- karma-cucumberjs adapter
- Project step definition JS files

After Karma finishes opening the browsers that you want to test against the adapter will load the HTML reporter CSS file, the app template, the feature files and the step definitions into the captured browsers.

```JavaScript
files: [
  // These are not watched because they're not expected to change.
  // These are not included because they are not JavaScript files and Karma inserts 
  // these as <script> tags.
  // These are served however, as the adapter will load them into the captured browsers.
  // The cucumber-html.css file can be copied and customized, simply change the path.
  // The adapter will load any file ending with '.css' into the captured browsers.
  {pattern: 'node_modules/karma-cucumberjs/vendor/cucumber-html.css', watched: false, 
   included: false, served: true},
  {pattern: 'path/to/app.template', watched: false, included: false, served: true},


  // These are not included because they're text feature files and shouldn't go in script tags.
  // These are watched because feature files will change during dev and you want Karma to run
  // tests when these change.
  // These are served by Karma so the adapter can load their contents when its time to test.
  {pattern: 'path/to/features/**/*.feature', watched: true, included: false, served: true},
  


  // The step definitions should be loaded last so the adapter can load the global functions 
  // needed by the step defs.
  // The step defs are watched and served so Karma runs when they change.
  {pattern: 'path/to/features/step_definitions/**/*.js', watched: true, included: true, served: true}
],

frameworks: ['cucumberjs']
...
```

## Step Definitions
Step definitions must be written slightly different than what you may be used to with Cucumber.js.
Each set of step definitions in a JS file needs to be wrapped in a callback and added to the list of step definitions using the addStepDefinitions() function.
An example is included below that is from ```features/step_definitions/Testing_steps.js```.
```JavaScript
// This addStepDefinitions() function is why the step definitions must 
// be configured to load after the adapter.
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


  // Before scenario hoooks
  scenario.Before(function (callback) {
    // Use a custom utility function
    this.appSpecificUtilityFunction();

    callback();
  });


  scenario.Given(/^some predetermined state$/, function(callback) {
    // Verify or set up an app state
    
    // Move to next step
    callback();
  });

  scenario.When(/^the user takes an action$/, function(callback) {
    // Trigger some user action
    
    // Move to next step
    callback();
  });

  scenario.Then(/^the app does something$/, function(callback) {
    // Verify the expected outcome
    
    // Move to next step
    callback();
  });

  // After scenario hooks
  scenario.After(function (callback) {
    callback();
  });
});
```

## app.template
The app.template file should contain an HTML partial used to set up the application under test and kick off the Cucumber run.
It would typically contain some HTML markup for the app, perhaps a script tag with some JS to start up the application, and a call to ```startCucumberRun()```, which is a global function that is added by the karma-cucumberjs adapter. The adapter will not start running tests until the function is called.
Below is the example app.template that is used to test the karma-cucumberjs adapter.
```HTML
<div id='myApp'>
  <div class='box' style='background-color: green;'>A box in my app</div>
</div>

<script type='text/javascript'>
  $('.box').click(function () {
    $('.box').css('background-color', 'red');
  });

  // This MUST be called once the application is ready to undergo testing.
  startCucumberRun();
</script>
```

##grunt-karma
The adapter is compatible with grunt-karma, take a look at the Gruntfile.js for karma-cucumberjs for an example. It is very simple to use, simply configure Karma as needed using the grunt config. The karma-cucumberjs Gruntfile is a working example of using Karma for both Jasmine and Cucumber.

#Bugs
Please report any bugs and feature requests using the GitHub issue tracker.

#Contributing
First off thank you for your interest in this project. I would be more than happy to have people help the project along by contributing fixes and features. I do however ask that each pull request is kept to a single feature as much as possible to ease the merging process. Also, please provide unit tests for your changes so that I can better understand the intended changes and so that I may integrate PRs as quickly and efficiently as possible. Thank you much again and hope this project helps you as much as it helps me!

# License
Copyright (c) 2013 Omar Gonzalez (s9tpepper) & contributors.
Licensed under the MIT license.
