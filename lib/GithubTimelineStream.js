/*
 * github-timeline-stream
 * http://github.com/arscan/github-timeline-stream
 *
 * Copyright (c) 2014 Rob Scanlon
 * Licensed under the MIT license.
 */

'use strict';

var stream = require('stream');
var util = require('util');
var request = require('request');
var jsonstream = require('JSONStream');

var url = 'https://github.com/timeline.json';

function GithubTimelineStream (interval) {
    var _this = this;
    var lastArray = [];
    var lastLookup = {};
    var index = 0;
    var maxHistory = 30;

    if(typeof interval !== "number"){
        interval = 6000;
    }

    stream.Readable.call(this, { objectMode : true });

    setInterval(function(){
        request(url)
           .pipe(jsonstream.parse("*"))
           .on('data', function(data){

               if(!lastLookup[data.url]){
                   _this.push(data);
               }
               delete lastLookup[lastArray[index]];
               lastLookup[index] = data.url;
               lastLookup[data.url] = true;
               index = (index+1) % maxHistory;
           });

    }, interval);
}

util.inherits(GithubTimelineStream, stream.Readable);

GithubTimelineStream.prototype._read = function(){};

module.exports = GithubTimelineStream;
