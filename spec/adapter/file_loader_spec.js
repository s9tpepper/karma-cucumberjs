define(['source/adapter/file_loader', 'spec/support/helper'], function (FileLoader, helper) {
  describe("FileLoader()", function () {

    var fileLoader, karma, window;

    beforeEach(function () {
      karma = helper.createSpyWithStubs("karma", {});
      window = helper.createSpyWithStubs("window", {});

      fileLoader = FileLoader(karma, window);
    });

    describe("constructor", function () {
      it('returns a FileLoader object/toString()', function () {
        var fileLoader = FileLoader();

        expect(fileLoader.toString()).toEqual('[object FileLoader]');
      });
    });

    describe('find()', function () {
      beforeEach(function () {
        var files = {
          '/path/to/file.css' : 'source',
          '/path/to/file.js' : 'source',
          '/path/to/file2.js' : 'source',
          '/path/to/file2.css' : 'source',
          '/path/to/file3.js' : 'source'
        };

        karma.files = files;
      });

      it('returns files that match the regular expression in an array', function () {
        var matchedFiles = fileLoader.find(/\.css$/);

        expect(matchedFiles).toEqual(['/path/to/file.css', '/path/to/file2.css']);
      });

      it('returns files that match the regular expression in an array2', function () {
        var files = {
          '/path/to/file2.css' : 'source',
          '/path/to/file.css' : 'source',
          '/path/to/file.js' : 'source',
          '/path/to/file2.js' : 'source',
          '/path/to/file3.css' : 'source'
        };
        karma.files = files;

        var matchedFiles = fileLoader.find(/\.css$/);

        expect(matchedFiles).toEqual(['/path/to/file2.css', '/path/to/file.css', '/path/to/file3.css']);
      });
    });

    describe('loadFile()', function () {
      var filePath, xmlHttp;

      beforeEach(function () {
        filePath = "path/to/file/to/load";

        xmlHttp = helper.createSpyWithStubs("xml http object", {open: null, send: null});

        window.XMLHttpRequest = helper.createSpyWithStubs("XMLHttpRequest", {});
        window.XMLHttpRequest.andReturn(xmlHttp);
      });

      describe('when the XMLHttpRequest exists', function () {
        beforeEach(function () {
          delete window.ActiveXObject;
          window.XMLHttpRequest = helper.createSpyWithStubs("XMLHttpRequest", {});
          window.XMLHttpRequest.andReturn(xmlHttp);
        });

        it('makes a new XMLHttpRequest object to load a file with', function () {
          fileLoader.loadFile(filePath);

          expect(window.XMLHttpRequest).toHaveBeenCalled();
        });
      });

      describe('when the XMLHttpRequest does not exist', function () {
        beforeEach(function () {
          delete window.XMLHttpRequest;
          window.ActiveXObject = helper.createSpyWithStubs("ActiveXObject", {});
          window.ActiveXObject.andReturn(xmlHttp);
        });

        it('makes a new ActiveXObject for XMLHTTP', function () {
          fileLoader.loadFile(filePath);

          expect(window.ActiveXObject).toHaveBeenCalledWith('Microsoft.XMLHTTP');
        });
      });

      it('opens a GET method synchronous connection to the file path', function () {
        fileLoader.loadFile(filePath);

        expect(xmlHttp.open).toHaveBeenCalledWith("GET", filePath, false);
      });

      it('sends the request to the server', function () {
        fileLoader.loadFile(filePath);

        expect(xmlHttp.send).toHaveBeenCalled();
      });

      it('returns the loaded contents of the requested file', function () {
        xmlHttp.responseText = "loaded file contents";

        var result = fileLoader.loadFile(filePath);

        expect(result).toEqual(xmlHttp.responseText);
      });
    });
  });
});