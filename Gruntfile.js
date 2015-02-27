'use strict';

module.exports = function (grunt) {
  var gruntConfig;
  gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: ['dist', 'tmp']
    },
    mkdir: {
      all: {
        options: {
          create: ['dist/reports']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        force: true,
        jshintrc: 'jshint.json'
      },
      src: [
        'lib/**/*.js',
        'test/*.js',
        '*.js'
      ]
    },
    mochacov: {
      test: {
        options: {
          reporter: 'spec',
          growl: process.stdout.isTTY
        }
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          output: 'dist/reports/coverage.html'
        }
      },
      coveralls: {
        options: {
          coveralls: true,
          output: 'dist/reports/coverage.lcov'
        }
      },
      options: {
        files: ['spec/*.js']
      }
    }
  };
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  grunt.initConfig(gruntConfig);
  grunt.registerTask('verify', ['mkdir', 'jshint']);
  grunt.registerTask('test', ['mkdir', 'mochacov:test']);
  grunt.registerTask('coverage', ['mkdir', 'mochacov:test', 'mochacov:coverage']);
  grunt.registerTask('coveralls', ['mkdir', 'mochacov:test', 'mochacov:coveralls']);
  grunt.registerTask('default', ['verify', 'coverage']);
};