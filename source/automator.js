(function () {
  var Automator = function Automator(window) {
    var log = Automator.log;

    var self = {
      back: function back() {
        window.history.back();
      },

      forward: function forward() {
        window.history.forward();
      },

      findOne: function findOne(selector) {
        return window.document.querySelector(selector);
      },

      findAll: function findAll(selector) {
        return window.document.querySelectorAll(selector);
      },

      click: function click(selector) {
        var elementClicked;
        var element = self.findOne(selector);

        if (element && typeof element.click === 'function') {
          element.click();
          elementClicked = true;
        } else if (!element || element && typeof element.click !== 'function') {
          elementClicked = false;
        }

        return elementClicked;
      },

      clickLabel: function clickLabel(label, tag) {
        tag = tag || "*";
        var escaped = self.quoteXPathAttributeString(label);
        var xpath = self.format('//%s[text()=%s]', tag, escaped);
        var selector = self.selectXPath(xpath);
        return self.click(selector);
      },


      getHTML: function getHTML(selector, outer) {
        var returnOuter = outer || false;
        var elementSelector = selector || "html";
        var element = self.findOne(elementSelector);
        return (returnOuter) ? element.outerHTML : element.innerHTML;
      },

      debugHTML: function debugHTML(selector, outer) {
        var specifiedSelector = selector || "html";
        var returnOuter = outer || false;
        var html = self.getHTML(specifiedSelector, returnOuter);
        Automator.log(html);
      },


      selectXPath: function selectXPath(expression) {
        "use strict";
        return {
          type: 'xpath',
          path: expression,
          toString: function() {
            return this.type + ' selector: ' + this.path;
          }
        };
      },

      format: function format(f) {
        "use strict";
        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(/%[sdj%]/g, function _replace(x) {
          if (i >= len) return x;
          switch (x) {
            case '%s':
              return String(args[i++]);
            case '%d':
              return Number(args[i++]);
            case '%j':
              return JSON.stringify(args[i++]);
            case '%%':
              return '%';
            default:
              return x;
          }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
          if (x === null || typeof x !== 'object') {
            str += ' ' + x;
          } else {
            str += '[obj]';
          }
        }
        return str;
      },

      quoteXPathAttributeString: function quoteXPathAttributeString(string) {
        "use strict";
        if (/"/g.test(string)) {
          return 'concat("' + string.toString().replace(/"/g, '", \'"\', "') + '")';
        } else {
          return '"' + string + '"';
        }
      }
    };






    return self;
  };


  define([], function () {
    Automator.log = console.log;
    return Automator;
  });
}());