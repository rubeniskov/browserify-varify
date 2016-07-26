'use strict'
/*jshint asi:true*/

var through = require('through2'),
    browserify = require('browserify'),
    expect = require("chai").expect,
    varify = require("..");

describe('Browserify Varify', function() {

    it('replaces all consts that are declare identifiers, but leaves others intact', function() {
        browserify()
            .plugin(require('..'))
            .add(__dirname + '/../example/sample.js')
            .bundle()
            .pipe(through(ondata, onend));

        var data = ''

        function ondata(d) {
            data += d
        }

        function onend() {
            var lines = data.split('\n')
            var startline = lines.indexOf('// sample start') + 1,
                endline = lines.indexOf('// sample end');

            expect(lines.slice(startline, endline)).to.deep
                .equal(["// this should be changed",
                    "var a = 1;",
                    "",
                    "// below two shouldn't",
                    "var keep = { const: 1 };",
                    "keep.const = 2;",
                    "",
                    "// only function assignment should be changed",
                    "var foo = function () {",
                    "  console.log('cannot change me');",
                    "  console.log('some const s should be left unchanged');",
                    "};"
                ]);
        }
    });
});
