'use strict';

var falafel = require('falafel'),
    through = require('through2'),
    extensions = ['js'],
    isParseableFile = function(filename, options) {
        extensions
            .concat(options.extension)
            .filter(Boolean)
            .map(function(ext) {
                return ext[0] === '.' ? ext.slice(1) : ext
            });
        return !!(new RegExp('\\.(' + extensions.join('|') + ')$').exec(filename) || []).length;
    };;

module.exports = function(b, options) {
    b.pipeline.get('deps').push(through.obj(function(data, enc, cb) {
        isParseableFile(data.file, options) && (data.source = falafel(data.source, { ecmaVersion: 6 }, function(node) {
            if (node.type === 'VariableDeclaration' && node.kind === 'const') {
                node.update('var' + node.source().substring(5));
            }
        }).toString());

        this.push(data);
        cb();
    }));
};
