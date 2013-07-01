define(["source/adapter/template_loader", "spec/support/helper"], function (TemplateLoader, helper) {
  describe("TemplateLoader()", function () {

    var templateLoader, karma, window, $, fileLoader, body, head, cucumber_html_reporter;

    beforeEach(function () {
      karma = helper.createSpyWithStubs("karma", {});
      window = helper.createSpyWithStubs("window", {});

      TemplateLoader.FileLoader = helper.createSpyWithStubs("FileLoader", {});
      fileLoader = helper.createSpyWithStubs("file loader", {find: null, loadFile: null});
      TemplateLoader.FileLoader.andReturn(fileLoader);

      $ = helper.createSpyWithStubs("jquery", {});
      TemplateLoader.$ = $;

      body = helper.createSpyWithStubs("body", {append: null});
      head = helper.createSpyWithStubs("head", {append: null});
      cucumber_html_reporter = helper.createSpyWithStubs("cucumber_html_reporter div", {prepend: null});
      $.andReturnSeveral([body, head, cucumber_html_reporter]);

      TemplateLoader.document = helper.createSpyWithStubs('document', {createElement: null});

      templateLoader = TemplateLoader(karma, window);
    });

    describe("constructor", function () {
      it("gets a reference to the body object", function () {
        expect($).toHaveBeenCalledWith("body");
      });

      it("gets a reference to the head element of the document", function () {
        expect($).toHaveBeenCalledWith("head");
      });

      it("starts a FileLoader", function () {
        expect(TemplateLoader.FileLoader).toHaveBeenCalledWith(karma, window);
      });
    });

    describe("loadHtml()", function () {
      beforeEach(function () {
        spyOn(templateLoader, "loadCSS");
        spyOn(templateLoader, "loadAppTemplate");
        spyOn(templateLoader, "loadFeatureRunnerTemplate");
      });

      it("loads the CSS files", function () {
        templateLoader.loadHtml();

        expect(templateLoader.loadCSS).toHaveBeenCalled();
      });

      it("loads the app template", function () {
        templateLoader.loadHtml();

        expect(templateLoader.loadAppTemplate).toHaveBeenCalled();
      });

      it("loads the Cucumber feature runner template", function () {
        templateLoader.loadHtml();

        expect(templateLoader.loadFeatureRunnerTemplate).toHaveBeenCalled();
      });
    });

    describe("loadCSS()", function () {
      var cssFiles;

      beforeEach(function () {
        cssFiles = [];
        cssFiles.forEach = jasmine.createSpy("forEach");
        fileLoader.find.andReturn([]);
      });

      it("asks the FileLoader to find files that end with .css", function () {
        templateLoader.loadCSS();

        expect(fileLoader.find).toHaveBeenCalledWith(/\.css$/);
      });

      describe('when the fileLoader finds matches', function () {
        beforeEach(function () {
          cssFiles.length = 3;
          fileLoader.find.andReturn(cssFiles);
        });

        it("adds a link tag for each CSS file that was found", function () {
          templateLoader.loadCSS();

          expect(cssFiles.forEach).toHaveBeenCalledWith(templateLoader.addLinkTag);
        });
      });

      describe('when the fileLoader does not find any matches', function () {
        beforeEach(function () {
          cssFiles.length = 0;
          fileLoader.find.andReturn(cssFiles);
        });

        it('doesn\'t try to add any empty links', function () {
          templateLoader.loadCSS();

          expect(cssFiles.forEach).not.toHaveBeenCalled();
        });
      });
    });

    describe("addLinkTag()", function () {

      var cssFilePath, newLinkTag;

      beforeEach(function () {
        cssFilePath = "/path/to/file.css";

        newLinkTag = helper.createSpyWithStubs("new link tag element", {});
        TemplateLoader.document.createElement.andReturn(newLinkTag);
      });

      it("creates a link tag element", function () {
        templateLoader.addLinkTag(cssFilePath);

        expect(TemplateLoader.document.createElement).toHaveBeenCalledWith("link");
      });

      it("returns the link tag element that was created", function () {
        var element = templateLoader.addLinkTag(cssFilePath);

        expect(element).toBe(newLinkTag);
      });

      it("sets the link tag's href property to the path of the css file", function () {
        var element = templateLoader.addLinkTag(cssFilePath);

        expect(element.href).toBe(cssFilePath);
      });

      it("sets the link tag's type attribute to text/css", function () {
        var element = templateLoader.addLinkTag(cssFilePath);

        expect(element.type).toBe("text/css");
      });

      it("sets the link tag's rel attribute to stylesheet", function () {
        var element = templateLoader.addLinkTag(cssFilePath);

        expect(element.rel).toBe("stylesheet");
      });

      it("appends the new link tag to the head element", function () {
        templateLoader.addLinkTag(cssFilePath);

        expect(head.append).toHaveBeenCalledWith(newLinkTag);
      });

    });

    describe('loadAppTemplate()', function () {
      var appTemplateContents;
      var appTemplate2Contents;
      beforeEach(function () {
        appTemplateContents = 'contents of the app.template file';
        appTemplate2Contents = 'contents of the some_other_file_app.template file';
      });

      it('looks for a file named app.template', function () {
        templateLoader.loadAppTemplate();

        expect(fileLoader.find).toHaveBeenCalledWith(/app\.template$/);
      });

      describe('when the fileLoader does not find a app.template', function () {
        beforeEach(function () {
          fileLoader.find.andReturn([]);
        });

        it('does not load any JS scripts', function () {
          templateLoader.loadAppTemplate();

          expect(fileLoader.loadFile).not.toHaveBeenCalled();
        });
      });

      describe('when the fileLoader does find app.template', function () {
        beforeEach(function () {
          fileLoader.find.andReturn(['/path/to/app.template']);
          fileLoader.loadFile.andReturn(appTemplateContents);
        });

        it('gets the cucumber_html_reporter div where the HTML updates go', function () {
          templateLoader.loadAppTemplate();

          expect($).toHaveBeenCalledWith('#cucumber_html_reporter');
        });

        it('asks the fileLoader to load the app template', function () {
          templateLoader.loadAppTemplate();

          expect(fileLoader.loadFile).toHaveBeenCalledWith('/path/to/app.template');
        });

        it('appends the loaded file content to the body tag of the captured browser', function () {
          templateLoader.loadAppTemplate();

          expect(cucumber_html_reporter.prepend).toHaveBeenCalledWith(appTemplateContents);
        });
      });

      describe('when the fileLoader finds multiple app.template matches', function () {
        beforeEach(function () {
          fileLoader.find.andReturn(['/path/to/app.template', '/path/to/some_other_file_app.template']);
          fileLoader.loadFile.andReturnSeveral([appTemplateContents, appTemplate2Contents]);
        });

        it('asks the fileLoader to load all the the app.template matches', function () {
          templateLoader.loadAppTemplate();

          expect(fileLoader.loadFile).toHaveBeenCalledWith('/path/to/app.template');
          expect(fileLoader.loadFile).toHaveBeenCalledWith('/path/to/some_other_file_app.template');
        });

        it('appends the loaded file contents of all the matches to the body tag of the captured browser', function () {
          templateLoader.loadAppTemplate();

          expect(cucumber_html_reporter.prepend).toHaveBeenCalledWith(appTemplateContents);
          expect(cucumber_html_reporter.prepend).toHaveBeenCalledWith(appTemplate2Contents);
        });
      });
    });

    describe('loadFeatureRunnerTemplate()', function () {
      var featureRunnerTemplate;

      beforeEach(function () {
        featureRunnerTemplate = TemplateLoader.FEATURE_RUNNER_TEMPLATE;
      });

      it('appends the feature runner HTML template to the captured browsers body', function () {
        templateLoader.loadFeatureRunnerTemplate();

        expect(body.append).toHaveBeenCalledWith(featureRunnerTemplate);
      });
    });
  });
});