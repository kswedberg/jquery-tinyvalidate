/* global module:false*/
module.exports = function(grunt) {
  const name = 'jquery.tinyvalidate';

  const lintedFiles = ['src/**/*.js', 'test/*.js', 'Gruntfile.js'];

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      ' * <%= pkg.description %>\n' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %>\n' +
      ' */\n',

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      all: {
        src: ['src/' + name + '.js', 'src/' + name + '.rules.js'],
        dest: name + '.all.js'
      },
      main: {
        src: ['src/' + name + '.js'],
        dest: name + '.js'
      },
      rules: {
        src: ['src/' + name + '.rules.js'],
        dest: name + '.rules.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      all: {
        src: '<%= concat.all.dest %>',
        dest: '' + name + '.all.min.js'
      }
    },
    eslint: {
      target: lintedFiles
    },
    qunit: {
      all: ['test/**/*.html']
    },
    watch: {

      scripts: {
        files: lintedFiles,
        tasks: ['qunit', 'eslint']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['concat']);
  grunt.registerTask('test', ['qunit']);
  // Default task.
  grunt.registerTask('default', ['qunit', 'concat']);

};
