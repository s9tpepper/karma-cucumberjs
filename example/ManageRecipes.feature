Feature: manage recipes
  Many of us love cucumbers. We love them so much we decided to
  start a diary of all those delicious recipes with cucumbers.

  Let's call it “Cukecipes”.

  Scenario: add recipe
    When I add a recipe
    Then I see the recipe in the diary