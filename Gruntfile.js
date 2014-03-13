module.exports = function (grunt) {
  grunt.initConfig({
    files: {
      karma_cucumber_files: [
        {pattern: 'vendor/*.css', watched: false, included: false, served: true},
        {pattern: 'app.template', watched: false, included: false, served: true},
        {pattern: 'features/**/*.feature', watched: true, included: false, served: true},
        {pattern: 'features/step_definitions/**/*.js', watched: true, included: true, served: true}
      ],

      jshint: ['source/**/*.js'],

      requirejs_dependencies: [
        '../vendor/cucumber.js',
        '../vendor/jquery-1.10.1.min.js',
        '../components/requirejs/require'
      ],

      watch_js: ['./source/**/*.js']
    },

    jshint: {
      all: "<%= files.jshint %>",
      options: {
        jshintrc: ".jshintrc"
      }
    },

    karma: {
      jasmine: {
        configFile: "karma.conf.js",
        singleRun: true,
        browsers: ["Chrome", "Firefox", "Safari"]
      },

      cuke_once: {
        configFile: "karma.conf.js",
        singleRun: true,
        browsers: ["Chrome"],
        files: "<%= files.karma_cucumber_files %>",
        plugins: ["karma-*", require("./lib/index")],
        frameworks : ["jasmine","requirejs", "cucumberjs"]
      },

      cucumber: {
        configFile: "karma.conf.js",
        singleRun: false,
        browsers: ["Chrome"],
        files: "<%= files.karma_cucumber_files %>",
        plugins: ["karma-*", require("./lib/index")],
        frameworks : ["jasmine","requirejs", "cucumberjs"]
      }
    },

    requirejs: {
      adapter: {
        options: {
          optimizeCss: false,
          baseUrl: './source',
          deps: "<%= files.requirejs_dependencies %>",
          name: 'main',
          optimize: 'uglify2',
          inlineText: false,
          isBuild: true,
          fileExclusionRegExp: /^\.|\.md$/,
          out: './lib/adapter.js'
        }
      }
    },

    watch: {
      js: {
        files: "<%= files.watch_js %>",
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-karma");

  grunt.registerTask('tests', ['jshint', 'karma:jasmine', 'karma:cuke_once']);
  grunt.registerTask("default", ["jshint", "karma:jasmine", "requirejs", 'karma:cuke_once']);
  grunt.registerTask("build_dev", ["jshint", "karma:jasmine", "requirejs:adapter_dev", 'karma:cuke_once']);
  grunt.registerTask('dev', ['default', 'watch']);
};
