(function (context) {
  var require = context.__require__;
  require.define("/app/features/support/cukestall.js", function(require, module, exports, __dirname, __filename, process) {
    var CukeStallSupport = function CukeStallSupport() {
      if (typeof window == 'undefined')
        return; // do not run outside of browsers

      // --- WORLD ---

      var CukeStallWorld = function CukeStallWorld(callback) {
        this.browser = new window.CukeStall.FrameBrowser('#cucumber-browser');
        this.runInSequence(
          this.cleanUp,
          callback
        );
      };

      this.World = CukeStallWorld;

      // DSL

      CukeStallWorld.prototype.addNewRecipe = function (callback) {
        var self = this;

        self.prepareNewRecipeAttributes();
        var visitRoot               = self.browser.visitUrl("/");
        var clickAddRecipeLink      = self.browser.clickLink("Add recipe");
        var fillInTitle             = self.browser.fillIn("#recipe_title", self.newRecipeAttributes.title);
        var fillInIngredients       = self.browser.fillIn("#recipe_ingredients", self.newRecipeAttributes.ingredients);
        var fillInInstructions      = self.browser.fillIn("#recipe_instructions", self.newRecipeAttributes.instructions);
        var clickCreateRecipeButton = self.browser.clickButton("button[type='submit'][name='save']");
        var waitForPageToLoad       = self.browser.waitForPageToLoad();
        self.runInSequence(
          visitRoot,
          clickAddRecipeLink,
          fillInTitle,
          fillInIngredients,
          fillInInstructions,
          clickCreateRecipeButton,
          waitForPageToLoad,
          callback
        );
      };

      CukeStallWorld.prototype.assertNewRecipeIsInDiary = function (callback) {
        var self = this;

        var visitRoot                         = self.browser.visitUrl("/");
        var clickRecipeLink                   = self.browser.clickLink(self.newRecipeAttributes.title);
        var waitForPageToLoad                 = self.browser.waitForPageToLoad();
        var assertDisplayedRecipeTitle        = self.browser.assertBodyText(self.newRecipeAttributes.title);
        var assertDisplayedRecipeIngredients  = self.browser.assertBodyText(self.newRecipeAttributes.ingredients);
        var assertDisplayedRecipeInstructions = self.browser.assertBodyText(self.newRecipeAttributes.instructions);
        self.runInSequence(
          visitRoot,
          clickRecipeLink,
          waitForPageToLoad,
          assertDisplayedRecipeTitle,
          assertDisplayedRecipeIngredients,
          assertDisplayedRecipeInstructions,
          callback
        );
      };

      // helpers

      CukeStallWorld.prototype.cleanUp = function (callback) {
        var resetAllRemotely = RemoteCommand("reset_all");
        var visitRoot        = this.browser.visitUrl("about:blank");
        this.runInSequence(
          resetAllRemotely,
          visitRoot,
          callback
        );
      };

      CukeStallWorld.prototype.prepareNewRecipeAttributes = function () {
        this.newRecipeAttributes = {
          title: "Cucumber au gratin",
          ingredients: "2 cucumbers\n\
  1 1/2 cups grated Gruyere cheese\n\
  salt & black pepper\n3-4 Tbs butter",
          instructions: "Peel the cucumbers & cut them into 3 inch pieces.\n\
  Slice each piece in half lengthwise & remove the seeds.\n\
  Cook the cucumber in boiling salted water for 10 minutes, the drain & dry.\n\
  Arrange a layer of cucumber in the base of a buttered ovenproof dish.\n\
  Sprinkle with a third of the cheese, & season with salt & pepper.\n\
  Repeat these layers, finishing with cheese. Dot the top with butter.\n\
  Bake the cucumber gratin in the center of a preheated oven at 400 for 30 minutes."
        };
      };

      CukeStallWorld.prototype.runInSequence = function () {
        var self      = this;
        var funcCalls = Array.prototype.slice.apply(arguments);
        var funcCall  = funcCalls.shift();
        if (funcCalls.length > 0) {
          var subCallback = function () { self.runInSequence.apply(self, funcCalls) };
          funcCall.call(self, subCallback);
        } else {
          funcCall.call(self);
        }
      };

      // Remote calls

      var getRemoteUrlForFunction = function (funcName) {
        return "/cukestall/" + funcName;
      };

      var RemoteQuery = function RemoteQuery(funcName, data) {
        var self = this;

        return function (callback) {
          var url = getRemoteUrlForFunction(funcName);
          $.getJSON(url, data, function (results, textStatus, jqXHR) {
            callback(results);
          });
        };
      };

      var RemoteCommand = function RemoteCommand(funcName, data) {
        var self = this;

        return function (callback) {
          var url = getRemoteUrlForFunction(funcName);
          $.post(url, data, function (results, textStatus, jqXHR) {
            callback();
          });
        };
      };
    };

    module.exports = CukeStallSupport;

  });
  require("/app/features/support/cukestall.js");

  require.define("/app/features/step_definitions/recipe_stepdefs.js",function(require,module,exports,__dirname,__filename,process){var recipeStepDefs = function() {
    this.After(function (callback) {
      if (this.tearDown) {
        this.tearDown(callback);
      } else {
        callback();
      }
    });

    this.When(/^I add a recipe$/, function(callback) {
      this.addNewRecipe(callback);
    });

    this.Then(/^I see the recipe in the diary$/, function(callback) {
      this.assertNewRecipeIsInDiary(callback);
    });
  };

// Node.js:
    if (typeof(module) !== 'undefined')
      module.exports = recipeStepDefs;

  });
  require("/app/features/step_definitions/recipe_stepdefs.js");

  context.supportCode = function () {

    require('/app/features/support/cukestall.js').call(this);
    require('/app/features/step_definitions/recipe_stepdefs.js').call(this);
  };
})(window);