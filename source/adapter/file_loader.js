(function (global) {

  var FileLoader = function FileLoader(karma, window) {
    var self = {
      find: function find(regex) {
        var matchingFiles = [];
        var files = karma.files;
        for (var filePath in files) {
          if (filePath.match(regex)) {
            matchingFiles.push(filePath);
          }
        }
        return matchingFiles;
      },

      loadFile: function loadFile(filePath) {
        var xmlHttp;

        if (window.XMLHttpRequest) {
          xmlHttp = new window.XMLHttpRequest();
        } else if (window.ActiveXObject) {
          xmlHttp = new window.ActiveXObject('Microsoft.XMLHTTP');
        }

        xmlHttp.open("GET", filePath, false);
        xmlHttp.send();
        return xmlHttp.responseText;
      },

      toString: function toString() {
        return '[object FileLoader]';
      }
    };

    return self;
  };

  define([], function () {
    return FileLoader;
  });

}(window));