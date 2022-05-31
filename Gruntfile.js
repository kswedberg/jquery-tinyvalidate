/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* <%= pkg.desc %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %>\n' +
      ' */\n',

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      all: {
        src: ['src/<%= pkg.name %>.js', 'src/<%= pkg.name %>.rules.js'],
        dest: '<%= pkg.name %>.all.js'
      },
      main: {
        src: ['src/<%= pkg.name %>.js'],
        dest: '<%= pkg.name %>.js'
      },
      rules: {
        src: ['src/<%= pkg.name %>.rules.js'],
        dest: '<%= pkg.name %>.rules.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      all: {
        src: '<%= concat.all.dest %>',
        dest: '<%= pkg.name %>.all.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        devel: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        node: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          $: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      srcTest: {
        src: ['src/**/*.js', 'test/*.js']
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      srcTest: {
        files: '<%= jshint.srcTest.src %>',
        tasks: ['qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['concat']);
  // Default task.
  grunt.registerTask('default', ['qunit', 'concat']);

};
