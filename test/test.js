'use strict';

var GithubTimelineStream = require('../lib/GithubTimelineStream.js');
var through = require("through");

suite('Stream Test', function(){
    var gth = new GithubTimelineStream();
    test('We can get at least 50 out', function(done){
        var count = 0;
        var finished = false;

        this.timeout(15000);
        console.log(count);


        gth.pipe(through(function(data){
                console.log(data);
                count++;
                if(count > 50 && !finished){
                    finished = true;
                    done();
                }

            })
        );

        /*
        gth.on('data', function(){
        });
       */
    });

    test('We dont get any dups', function(done){

        var ids = {};
        var count= 0;
        var finished = false;

        this.timeout(13000);


        gth.on('data', function(data){
            console.log("GETTING STUFF");
            count++;
            if(ids[data.url]){
                done("Found duplicate item!");
            }

            ids[data.url] = true;
            if(count > 50 && !finished){
                finished = true;
                done();
            }
        });
    });
});
