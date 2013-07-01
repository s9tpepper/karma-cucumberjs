(function (global) {
  var TemplateLoader = function TemplateLoader(karma, window) {
    var $ = TemplateLoader.$;
    var body = $('body');
    var head = $('head');

    var fileLoader = TemplateLoader.FileLoader(karma, window);

    var self = {
      loadHtml: function loadHtml() {
        self.loadCSS();
        self.loadFeatureRunnerTemplate();
        self.loadAppTemplate();
      },

      loadCSS: function loadCSS() {
        var cssFiles = fileLoader.find(TemplateLoader.CSS_REGEX);
        if (cssFiles && cssFiles.length > 0) {
          cssFiles.forEach(self.addLinkTag);
        }
      },

      loadAppTemplate: function loadAppTemplate() {
        var matches = fileLoader.find(TemplateLoader.APP_TEMPLATE_REGEX);
        if (matches && matches.length) {
          var cucumberHtmlReporter = $('#cucumber_html_reporter');
          matches.forEach(function (match) {
            cucumberHtmlReporter.prepend(fileLoader.loadFile(match));
          });
        }
      },

      loadFeatureRunnerTemplate: function loadFeatureRunnerTemplate() {
        body.append(TemplateLoader.FEATURE_RUNNER_TEMPLATE);
      },

      addLinkTag: function addLinkTag(filePath) {
        var link  = TemplateLoader.document.createElement('link');
        link.href = filePath;
        link.type = "text/css";
        link.rel  = "stylesheet";
        head.append(link);
        return link;
      }
    };

    return self;
  };

  TemplateLoader.FEATURE_RUNNER_TEMPLATE = '' +
    '<div class="cucumberjs">karma-cucumberjs</div>' +
    '<div id="cucumber_html_reporter" style="position: relative; z-index: 9999;"></div>';

  TemplateLoader.CSS_REGEX = /\.css$/;
  TemplateLoader.APP_TEMPLATE_REGEX = /app\.template$/;

  define(['./file_loader'], function (FileLoader) {
    TemplateLoader.FileLoader = FileLoader;

    // The adapter contains jquery, this reference is assumed to exist
    TemplateLoader.$ = global.$;

    TemplateLoader.document = global.document;

    return TemplateLoader;
  });
}(window));