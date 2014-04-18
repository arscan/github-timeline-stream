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
var http = require('https');
var url = 'https://github.com/timeline.json';
var _ = require('underscore');

var last = [];

function GithubTimelineStream () {
    stream.Readable.call(this, { objectMode : true });

    this.connecting = false;
}

util.inherits(GithubTimelineStream, stream.Readable);

GithubTimelineStream.prototype._read = function(){
    var _this = this;
    if(this.connecting){
        return;
    };
    this.connecting = true;

    setInterval(function(){
        _this._run();
    }, 500);
};

GithubTimelineStream.prototype._run = function(){
    var _this = this;

    http.get(url,function(res) {
        var data = "";
        res.on('data', function(d){
            data += d;

        });
        res.on('end', function(){

            try {

                var newevents = JSON.parse(data);


                last = _.reject(_.pluck(newevents,"url"), function(url){
                    return _.contains(last,url);
                });

                var count = 0;

                _.each(newevents, function(val){


                    if(_.contains(last,val.url)){
                        count++;

                        _this.push(val);

                        //ircclient.say(channel,  createMessage(val));
                    }
                });

            } catch (ex) {

                console.log("Error processing event: " + ex);
            }


        });
    }).on('error', function(e){
        console.log("Error running http request: ", e);
    });

};


module.exports = GithubTimelineStream;
