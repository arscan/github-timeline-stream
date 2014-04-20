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

// var last = [];

function GithubTimelineStream () {
    var _this = this;

    this.maxHistory = 50;
    this.interval = 6000;

    this.lastArray = [];
    this.lastLookup = {};
    this.index = 0;

    stream.Transform.call(this, { objectMode : true });

    setInterval(function(){
        console.log("working");
        request(url)
           .pipe(jsonstream.parse("*"))
           .pipe(_this);
    }, this.interval);
}

util.inherits(GithubTimelineStream, stream.Transform);

GithubTimelineStream.prototype._transform = function(data){
    console.log("------------");
    console.log(data);
    console.log("!!!!!!!!!!!!");

    if(!this.lastLookup[data.url]){

        this.push(data);

    }
    delete this.lastLookup[this.lastArray[this.index]];
    this.lastLookup[this.index] = data.url;
    this.lastLookup[data.url] = true;
    this.index = (this.index+1) % this.maxHistory;

    /*
    for(var i = 0; i < data.length; i++){
        if(!this.lastLookup[data[i].url]){

            this.push(data[i]);

        }
        delete this.lastLookup[this.lastArray[this.index]];
        this.lastLookup[this.index] = data[i].url;
        this.lastLookup[data[i].url] = true;
        this.index = (this.index+1) % this.maxHistory;
    }
   */


};

GithubTimelineStream.prototype._run = function(){
    /*
    var _this = this;

    http.get(url,function(res) {
        console.log("----------");
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
   */

};


module.exports = GithubTimelineStream;
