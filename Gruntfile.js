module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    base: "",
                    port: 9999
                }
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    username: 'mobile-button',
                    key: process.env.SAUCE_ACCESS_KEY || '',
                    urls: ["http://localhost:9999/test/index.html"],
                    tunnelTimeout: 5,
                    build: (new Date()).getTime(),
                    concurrency: 3,
                    browsers: grunt.file.readJSON('browsers.json').browsers,
                    testname: "mobile-button tests",
                    tags: ["master"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-saucelabs");

    grunt.registerTask("test-sauce", ["connect", "saucelabs-mocha"]);
    grunt.registerTask('default', ['test-sauce']);
};
