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

var url = 'https://api.github.com/events';
var userAgent = 'github.com/arscan/github-timeline-stream';

function GithubTimelineStream (opts) {
    var _this = this;

    var lastArray = [],
        lastLookup = {},
        index = 0,
        maxHistory = 30,
        pauseUntil = 0,
        sentLowNotice = false,
        interval = 3000,
        token = null,
        username = null,
        password = null;

    if(opts !== undefined){
        if(opts.token !== undefined){
            token = opts.token;
        }
        if(opts.username !== undefined){
            username = opts.username;
        }
        if(opts.password !== undefined){
            password = opts.password;
        }
        if(opts.interval !== undefined){
            interval = opts.interval
        }
    }


    if(typeof interval !== "number"){
        interval = 5000;
    }

    stream.Readable.call(this, { objectMode : true });

    setInterval(function(){
        var requestOpts = {};

        if(Date.now()/1000 < pauseUntil){
            return;
        }

        requestOpts.url = url;
        requestOpts.headers = {
            "User-Agent": userAgent,
            "Accept": "application/vnd.github.v3+json"
        };

        if(token !== null){
            requestOpts.auth = {
                user: token,
                pass: "x-oauth-basic",
                sendImmediately: true
            }

        } else if(username !== null && password !== null){
            requestOpts.auth = {
                user: username,
                pass: password,
                sendImmediately: true
            }
        }

        request(requestOpts)
          .on('response', function(response){
              var rateRemaining = parseInt(response.headers['x-ratelimit-remaining'], 10),
                  rateReset = parseInt(response.headers['x-ratelimit-reset'], 10);

              if(rateRemaining <= 60 ){
                  if(!sentLowNotice){
                      console.log("Github-timeline-stream: You have only " + rateRemaining + " requests remaining, you probably should authenticate.  See Readme");
                      sentLowNotice = true;
                  }
              } 
              
              if (rateRemaining < 1){
                  console.log("Github-timeline-stream: You have exhausted your requests.  Consider authenticating");
                  pauseUntil = parseInt(response.headers['x-ratelimit-reset'], 10);
              }
          })
          .on('error', function(e){
              console.log("Github-timeline-stream: Error getting page: " + e);
           })
           .pipe(jsonstream.parse("*"))
           .on('error', function(e){
              console.log("Github-timeline-stream: Error parsing json: " + e);
           })
           .on('data', function(data){
               if(!lastLookup[data.id]){
                   _this.push(data);
               }
               delete lastLookup[lastArray[index]];
               lastArray[index] = data.id;
               lastLookup[data.id] = true;
               index = (index+1) % maxHistory;
           });

    }, interval);
}

util.inherits(GithubTimelineStream, stream.Readable);

GithubTimelineStream.prototype._read = function(){};

module.exports = GithubTimelineStream;
