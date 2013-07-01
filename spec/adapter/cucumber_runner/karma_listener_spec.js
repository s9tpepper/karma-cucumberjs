define(['source/adapter/cucumber_runner/karma_listener', 'spec/support/helper'], function (KarmaListener, helper) {
  describe('KarmaListener()', function () {
    var karmaListener, karma;

    beforeEach(function () {
      karma = helper.createSpyWithStubs('karma', {info: null, result: null});
      karmaListener = KarmaListener(karma);
    });

    describe('constructor', function () {
      it('sets the currentStep property to null', function () {
        expect(karmaListener.currentStep).toBeNull();
      });

      it('sets the currentScenario property to null', function () {
        expect(karmaListener.currentScenario).toBeNull();
      });

      it('sets the currentFeature property to null', function () {
        expect(karmaListener.currentFeature).toBeNull();
      });

      it('sets the scenarioSuccess property to true', function () {
        expect(karmaListener.scenarioSuccess).toBe(true);
      });

      it('sets the scenarioSkipped property to false', function () {
        expect(karmaListener.scenarioSkipped).toBe(false);
      });

      it('sets the scenarioLog property to an empty list', function () {
        expect(karmaListener.scenarioLog).toEqual([]);
      });

      it('sets the totalSteps back to 0', function () {
        expect(karmaListener.totalSteps).toBe(0);
      });

      it('returns a KarmaListener object', function () {
        expect(karmaListener.toString()).toEqual('[object KarmaListener]');
      });

      it('returns an object with a hear function', function () {
        expect(karmaListener.hear).toBeAnInstanceOf(Function);
      });
    });

    describe('hear()', function () {
      var event, callback;

      beforeEach(function () {
        event = helper.createSpyWithStubs('event', {getName: null});
        callback = helper.createSpyWithStubs('callback', {});

        spyOn(karmaListener, 'beforeFeature');
        spyOn(karmaListener, 'beforeScenario');
        spyOn(karmaListener, 'beforeStep');
        spyOn(karmaListener, 'stepResult');
      });

      it('gets the name of the cucumberjs event', function () {
        karmaListener.hear(event, callback);

        expect(event.getName).toHaveBeenCalled();
      });

      describe('when the event name is BeforeFeature', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeFeature');
        });

        it('handles the BeforeFeature event with the beforeFeature method', function () {
          karmaListener.hear(event, callback);

          expect(karmaListener.beforeFeature).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is BeforeScenario', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeScenario');
        });

        it('handles the BeforeScenario event with the beforeScenario method', function () {
          karmaListener.hear(event, callback);

          expect(karmaListener.beforeScenario).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is BeforeStep', function () {
        beforeEach(function () {
          event.getName.andReturn('BeforeStep');
        });

        it('handles the BeforeStep event with the beforeStep method', function () {
          karmaListener.hear(event, callback);

          expect(karmaListener.beforeStep).toHaveBeenCalledWith(event);
        });
      });

      describe('when the event name is StepResult', function () {
        beforeEach(function () {
          event.getName.andReturn('StepResult');
        });

        it('handles the StepResult event with the stepResult method', function () {
          karmaListener.hear(event, callback);

          expect(karmaListener.stepResult).toHaveBeenCalledWith(event);
        });
      });

      it('invokes the CucumberJS callback so CucumberJS can move on to next step', function () {
        karmaListener.hear(event, callback);

        expect(callback).toHaveBeenCalled();
      });
    });

    describe('beforeFeature()', function () {
      var event, feature;

      beforeEach(function () {
        feature = 'cucumberjs feature object';
        event = helper.createSpyWithStubs('event', {getPayloadItem: feature});
      });

      it('gets the feature payload item from the event', function () {
        karmaListener.beforeFeature(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('feature');
      });

      it('sets the currentFeature property to the payload item from the event', function () {
        karmaListener.beforeFeature(event);

        expect(karmaListener.currentFeature).toBe(feature);
      });
    });

    describe('beforeScenario()', function () {
      var event, scenario;

      beforeEach(function () {
        scenario = helper.createSpyWithStubs('scenario event payload item', {});
        delete scenario._time;
        event = helper.createSpyWithStubs('event', {getPayloadItem: scenario})
      });

      it('gets the scenario payload item from the cucumberjs event', function () {
        karmaListener.beforeScenario(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('scenario');
      });

      it('sets the currentScenario property to the payload item from the event', function () {
        karmaListener.beforeScenario(event);

        expect(karmaListener.currentScenario).toBe(scenario);
      });

      it('stores the current time on the currentScenario._time property', function () {
        karmaListener.beforeScenario(event);

        expect(scenario._time).toBeAnInstanceOf(Number);
      });
    });

    describe('beforeStep()', function () {
      var event, step;

      beforeEach(function () {
        step = helper.createSpyWithStubs('step event payload item', {});
        event = helper.createSpyWithStubs('event', {getPayloadItem: step});
      });

      it('gets the step payload item from the cucumberjs event', function () {
        karmaListener.beforeStep(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('step');
      });

      it('sets the currentStep property with the step payload item from the event', function () {
        karmaListener.beforeStep(event);

        expect(karmaListener.currentStep).toBe(step);
      });
    });

    describe('stepResult()', function () {
      var event, result, scenarioSkippedResult, stepSuccessful, scenarioTimeElapsed;

      beforeEach(function () {
        result = helper.createSpyWithStubs('step result payload item', {});
        event = helper.createSpyWithStubs('event', {getPayloadItem: result});

        karmaListener.currentScenario = helper.createSpyWithStubs('current scenario reference', {getName: 'scenario name'});
        karmaListener.currentFeature = helper.createSpyWithStubs('current feature reference', {getName: 'feature name'});

        spyOn(karmaListener, 'checkStepSuccess');
        spyOn(karmaListener, 'checkStepSkipped');
        spyOn(karmaListener, 'checkStepFailure');
        spyOn(karmaListener, 'getScenarioTimeElapsed');

        scenarioSkippedResult = 'result of scenario skipped status';
        karmaListener.checkStepSkipped.andReturn(scenarioSkippedResult);

        stepSuccessful = 'result of step success check';
        karmaListener.checkStepSuccess.andReturn(stepSuccessful);

        scenarioTimeElapsed = 'time elapsed during scenario';
        karmaListener.getScenarioTimeElapsed.andReturn(scenarioTimeElapsed);
      });

      it('increments the totalSteps property by one', function () {
        var initialTotalSteps = karmaListener.totalSteps;

        karmaListener.stepResult(event);

        expect(karmaListener.totalSteps).toEqual(initialTotalSteps + 1);
      });

      it('updates Karma with the latest total steps count', function () {
        var currentTotalSteps = 5;
        karmaListener.totalSteps = currentTotalSteps;

        karmaListener.stepResult(event);

        var expectedInfoUpdate = {total: currentTotalSteps + 1};
        expect(karma.info).toHaveBeenCalledWith(expectedInfoUpdate);
      });

      it('gets the stepResult payload item from the cucumberjs event', function () {
        karmaListener.stepResult(event);

        expect(event.getPayloadItem).toHaveBeenCalledWith('stepResult');
      });

      it('checks if the stepResult was successful', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.checkStepSuccess).toHaveBeenCalledWith(result);
      });

      it('checks if the stepResult was skipped', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.checkStepSkipped).toHaveBeenCalledWith(result);
      });

      it('checks if the stepResult had a failure', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.checkStepFailure).toHaveBeenCalledWith(result);
      });

      it('gets the current scenario name', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.currentScenario.getName).toHaveBeenCalled();
      });

      it('gets the current feature name', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.currentFeature.getName).toHaveBeenCalled();
      });

      it('gets the time stamp for the executed step', function () {
        karmaListener.stepResult(event);

        expect(karmaListener.getScenarioTimeElapsed).toHaveBeenCalledWith(scenarioSkippedResult);
      });

      it('reports the step results data to Karma', function () {
        karmaListener.stepResult(event);

        var expectedResults = {
          description: 'scenario name',
          log: karmaListener.scenarioLog,
          suite: ['feature name'],
          success: stepSuccessful,
          skipped: scenarioSkippedResult,
          time: scenarioTimeElapsed
        };
        expect(karma.result).toHaveBeenCalledWith(expectedResults);
      });
    });

    describe('checkStepSuccess()', function () {
      var stepResult;

      beforeEach(function () {
        stepResult = helper.createSpyWithStubs('cucumberjs step result', {isSuccessful: null});
      });

      describe('when the scenario success is currently successful and the step result is a success', function () {
        beforeEach(function () {
          karmaListener.scenarioSuccess = true;
          stepResult.isSuccessful.andReturn(true);
        });

        it('returns true', function () {
          var success = karmaListener.checkStepSuccess(stepResult);

          expect(success).toBe(true);
        });
      });

      describe('when the scenario success is currently successful and the step result is not a success', function () {
        beforeEach(function () {
          karmaListener.scenarioSuccess = true;
          stepResult.isSuccessful.andReturn(false);
        });

        it('returns false', function () {
          var success = karmaListener.checkStepSuccess(stepResult);

          expect(success).toBe(false);
        });
      });

      describe('when the scenario success is currently not successful but the step result is a success', function () {
        beforeEach(function () {
          karmaListener.scenarioSuccess = false;
          stepResult.isSuccessful.andReturn(true);
        });

        it('returns false', function () {
          var success = karmaListener.checkStepSuccess(stepResult);

          expect(success).toBe(false);
        });
      });

      describe('when the scenario success is currently not successful but the step result is also not a success', function () {
        beforeEach(function () {
          karmaListener.scenarioSuccess = false;
          stepResult.isSuccessful.andReturn(false);
        });

        it('returns false', function () {
          var success = karmaListener.checkStepSuccess(stepResult);

          expect(success).toBe(false);
        });
      });
    });

    describe('checkStepSkipped()', function () {
      var stepResult, skippedResult;

      beforeEach(function () {
        skippedResult = 'is skipped result';
        stepResult = helper.createSpyWithStubs('step result', {isSkipped: skippedResult});
      });

      it('asks the step result if it was skipped', function () {
        karmaListener.checkStepSkipped(stepResult);

        expect(stepResult.isSkipped).toHaveBeenCalled();
      });

      it('returns the skipped result from the step result', function () {
        var skipped = karmaListener.checkStepSkipped(stepResult);

        expect(skipped).toBe(skippedResult);
      });
    });

    describe('checkStepFailure()', function () {
      var stepResult, error;

      beforeEach(function () {
        stepResult = helper.createSpyWithStubs('cucumberjs step result', {
          isSuccessful: null,
          isUndefined: null,
          isPending: null,
          isSkipped: null,
          getFailureException: null
        });
      });

      describe('when the step is not successful, not pending, not undefined and not skipped', function () {
        beforeEach(function () {
          stepResult.isSuccessful.andReturn(false);
          stepResult.isUndefined.andReturn(false);
          stepResult.isPending.andReturn(false);
          stepResult.isSkipped.andReturn(false);

          karmaListener.scenarioLog = helper.createSpyWithStubs('log array', {push: null});
          karmaListener.currentStep = helper.createSpyWithStubs('current step object', {getName: 'current step name'});

          error = {};
          stepResult.getFailureException.andReturn(error);
        });

        it('gets the failure exception object from the step result', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(stepResult.getFailureException).toHaveBeenCalled();
        });

        it('gets the current step name', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(karmaListener.currentStep.getName).toHaveBeenCalled();
        });

        describe('when the error has a stack set', function () {
          beforeEach(function () {
            error.stack = 'an error stack trace';
          });

          it('adds an entry to the scenario log with the step name and stack error', function () {
            karmaListener.checkStepFailure(stepResult);

            expect(karmaListener.scenarioLog.push).toHaveBeenCalledWith('current step name\nan error stack trace');
          });
        });

        describe('when the error does not have a stack set', function () {
          beforeEach(function () {
            error = 'an error w/out a stack property';
          });

          it('adds an entry to the scenario log with the step name and the error.toString()', function () {
            karmaListener.checkStepFailure(stepResult);

            expect(karmaListener.scenarioLog.push).toHaveBeenCalledWith('current step name\n[object Object]');
          });
        });
      });

      describe('when the step is successful', function () {
        beforeEach(function () {
          stepResult.isSuccessful.andReturn(true);
          karmaListener.scenarioLog = [];
        });

        it('does not make an entry into the scenario log', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(karmaListener.scenarioLog).toEqual([]);
        });
      });

      describe('when the step is undefined', function () {
        beforeEach(function () {
          stepResult.isUndefined.andReturn(true);
          karmaListener.scenarioLog = [];
        });

        it('does not make an entry into the scenario log', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(karmaListener.scenarioLog).toEqual([]);
        });
      });

      describe('when the step is pending', function () {
        beforeEach(function () {
          stepResult.isPending.andReturn(true);
          karmaListener.scenarioLog = [];
        });

        it('does not make an entry into the scenario log', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(karmaListener.scenarioLog).toEqual([]);
        });
      });

      describe('when the step is skipped', function () {
        beforeEach(function () {
          stepResult.isSkipped.andReturn(true);
          karmaListener.scenarioLog = [];
        });

        it('does not make an entry into the scenario log', function () {
          karmaListener.checkStepFailure(stepResult);

          expect(karmaListener.scenarioLog).toEqual([]);
        });
      });
    });

    describe('getScenarioTimeElapsed()', function () {
      var scenarioSkippedStatus;

      describe('when the scenario was skipped', function () {
        beforeEach(function () {
          scenarioSkippedStatus = true;
        });

        it('returns 0 because no time elapsed for this step', function () {
          var timeElapsed = karmaListener.getScenarioTimeElapsed(scenarioSkippedStatus);

          expect(timeElapsed).toBe(0);
        });
      });

      describe('when the scenario was not skipped', function () {
        beforeEach(function () {
          scenarioSkippedStatus = false;
          karmaListener.currentStep = {
            _time: 200
          };
        });

        it('returns a number greater than 0 representing the amount of seconds that elapsed since the step starting running', function () {
          var timeElapsed = karmaListener.getScenarioTimeElapsed(scenarioSkippedStatus);

          expect(timeElapsed).toBeGreaterThan(0);
        });
      });
    });
  });
});