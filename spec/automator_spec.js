define(["source/automator", "spec/support/helper"], function (Automator, helper) {
  describe('Automator()', function () {
    var automator,
      window;

    beforeEach(function () {
      window = helper.createSpyWithStubs("window");
      window.history = helper.createSpyWithStubs("history", {back: null, forward: null});
      window.document = helper.createSpyWithStubs("document", {querySelector: null, querySelectorAll: null});
      automator = Automator(window);
    });


    describe('back()', function () {
      it('calls the window.history.back function to go back once in the browser history', function () {
        automator.back();

        expect(window.history.back).toHaveBeenCalledWith();
      });
    });

    describe('forward()', function () {
      it('calls the window.history.forward function to go foward once in the browser history', function () {
        automator.forward();

        expect(window.history.forward).toHaveBeenCalledWith();
      });
    });

    describe('findOne()', function () {
      var aSelector, result;

      beforeEach(function () {
        aSelector = "a selector";
        result = "document.querySelector result";

        window.document.querySelector.andReturn(result);
      });

      it('invokes the window.document.querySelector method using the specified selector', function () {
        automator.findOne(aSelector);

        expect(window.document.querySelector).toHaveBeenCalledWith(aSelector);
      });

      it('returns the result from the document.querySelector method', function () {
        var queryResult = automator.findOne(aSelector);

        expect(queryResult).toBe(result);
      });
    });

    describe('findAll()', function () {

      var aSelector, result;

      beforeEach(function () {
        aSelector = "a selector";
        result = "document.querySelectorAll result";

        window.document.querySelectorAll.andReturn(result);
      });

      it('invokes the window.document.querySelectorAll method using the specified selector', function () {
        automator.findAll(aSelector);

        expect(window.document.querySelectorAll).toHaveBeenCalledWith(aSelector);
      });

      it('returns the result from the querySelectorAll function', function () {
        var queryResult = automator.findAll(aSelector);

        expect(queryResult).toBe(result);
      });
    });

    describe('click()', function () {
      var testSelector = "a selector";

      beforeEach(function () {
        spyOn(automator, "findOne");
      });

      it('finds the first element matching the specified selector', function () {
        automator.click(testSelector);

        expect(automator.findOne).toHaveBeenCalledWith(testSelector);
      });

      describe('when the selector returns an element with a click() function', function () {
        var anElement;

        beforeEach(function () {
          anElement = helper.createSpyWithStubs("element", {click: null});
          automator.findOne.andReturn(anElement);
        });

        it('invokes the click() function on the found element', function () {
          automator.click(testSelector);

          expect(anElement.click).toHaveBeenCalled();
        });

        it('returns a true indicating that a click was triggered', function () {
          var result = automator.click(testSelector);

          expect(result).toBe(true);
        });
      });

      describe('when the selector returns an element without a click() function', function () {
        var anElement;

        beforeEach(function () {
          anElement = helper.createSpyWithStubs("element", {});
          automator.findOne.andReturn(anElement);
        });

        it('does not throw an error trying to invoke a click() function', function () {
          expect(function () {
            automator.click(testSelector);
          }).not.toThrow();
        });

        it('returns a false indicating that a click was not triggered', function () {
          var result = automator.click(testSelector);

          expect(result).toBe(false);
        });
      });

      describe('when the selector does not return an element', function () {
        beforeEach(function () {
          automator.findOne.andReturn(null);
        });

        it('does not throw an error trying to examine a returned element', function () {
          expect(function () {
            automator.click(testSelector);
          }).not.toThrow();
        });

        it('returns a false indicating that a click was not triggered', function () {
          var result = automator.click(testSelector);

          expect(result).toBe(false);
        });
      });
    });

    describe('clickLabel()', function () {
      beforeEach(function () {
        spyOn(automator, "quoteXPathAttributeString");
        automator.quoteXPathAttributeString.andReturn("escaped text");

        spyOn(automator, "selectXPath");
        automator.selectXPath.andReturn("xpath selector string");

        spyOn(automator, "format");
        automator.format.andReturn("xpath");

        spyOn(automator, "click");
        automator.click.andReturn("click result boolean");
      });

      it('escapes the specified click label', function () {
        automator.clickLabel("test label");

        expect(automator.quoteXPathAttributeString).toHaveBeenCalledWith("test label");
      });

      describe('when you specify a tag', function () {
        it('formats the search into an XPath string using the specified tag and the escaped label text', function () {
          automator.clickLabel("test label", "div");

          expect(automator.format).toHaveBeenCalledWith('//%s[text()=%s]', "div", "escaped text");
        });
      });

      describe('when you do not specify a tag', function () {
        it('formats the search into an XPath string using the default tag value and the escaped label text', function () {
          automator.clickLabel("test label");

          var defaultTag = "*";
          expect(automator.format).toHaveBeenCalledWith('//%s[text()=%s]', defaultTag, "escaped text");
        });
      });

      it('formats the search into an XPath string', function () {
        automator.clickLabel("test label");

        var defaultTag = "*";
        expect(automator.format).toHaveBeenCalledWith('//%s[text()=%s]', defaultTag, "escaped text");
      });

      it('gets a selector using the xpath', function () {
        automator.clickLabel("test label");

        expect(automator.selectXPath).toHaveBeenCalledWith("xpath");
      });

      it('invokes a click using the xpath selector', function () {
        automator.clickLabel("test label");

        expect(automator.click).toHaveBeenCalledWith("xpath selector string");
      });

      it('returns the click result', function () {
        var result = automator.clickLabel("test label");

        expect(result).toBe("click result boolean");
      });
    });

    describe('getHTML()', function () {
      var htmlElement;

      beforeEach(function () {
        htmlElement = {};
        htmlElement.innerHTML = "inner html value";
        htmlElement.outerHTML = "outer html value";

        spyOn(automator, "findOne");
        automator.findOne.andReturn(htmlElement);
      });

      describe('when no parameters are used', function () {
        it('gets the html element', function () {
          automator.getHTML();

          expect(automator.findOne).toHaveBeenCalledWith("html");
        });
      });

      describe('when a selector is used', function () {
        it('gets an element using the specified selector', function () {
          automator.getHTML("a selector");

          expect(automator.findOne).toHaveBeenCalledWith("a selector");
        });
      });

      describe('when the outer flag is not set', function () {
        it('outer defaults to false and returns the elements inner html', function () {
          var result = automator.getHTML("a selector");

          expect(result).toBe("inner html value");
        });
      });

      describe('when the outer flag is set to true', function () {
        it('returns the outer html of the element', function () {
          var result = automator.getHTML("a selector", true);

          expect(result).toBe("outer html value");
        });
      });
    });
    
    describe('debugHTML()', function () {
      beforeEach(function () {
        spyOn(Automator, "log");

        spyOn(automator, "getHTML");
        automator.getHTML.andReturn("some text");
      });

      describe('when no parameters are used', function () {
        it('gets the html element\'s outer html contents', function () {
          automator.debugHTML();

          expect(automator.getHTML).toHaveBeenCalledWith("html", false);
        });
      });

      describe('when a selector is used', function () {
        it('gets an element using the specified selector', function () {
          automator.debugHTML('div.aStyle');

          expect(automator.getHTML).toHaveBeenCalledWith("div.aStyle", false);
        });
      });

      it('writes the resulting text to the console.log()', function () {
        automator.debugHTML();

        expect(Automator.log).toHaveBeenCalledWith("some text");
      });
    });
    
  });
});
