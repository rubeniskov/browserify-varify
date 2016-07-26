'use strict';

var through = require('through'),
    redeyed = require('redeyed'),
    extensions = ['js'],
    isParseableFile = function(filename, options) {
        extensions
            .concat(options.extension)
            .filter(Boolean)
            .map(function(ext) {
                return ext[0] === '.' ? ext.slice(1) : ext
            });
        return !!(new RegExp('\\.(' + extensions.join('|') + ')$').exec(filename) || []).length;
    };

var config = {
    Keyword: {
        const: function(tokenString, info) {
            var idx = info.tokenIndex,
                tokens = info.tokens,
                nextToken = tokens[idx + 1];

            return nextToken && nextToken.type === 'Identifier' ? 'var' : tokenString;
        }
    }
};

module.exports = function(filename, options) {
    var data = '';

    function ondata(d) {
        data += d;
    }

    function onend() {
        if (isParseableFile(filename, options)) {
            try {
                this.queue(redeyed(data, config).code);
            } catch (e) {
                console.error('unable to remove consts from ' + filename);
                console.error(e);
                this.queue(data);
            }
        } else {
            this.queue(data);
        }
        this.emit('end');
    }
    return through(ondata, onend);
};
