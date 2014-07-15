'use strict';

var GithubTimelineStream = require('../lib/GithubTimelineStream.js');
var through = require("through");

suite('Stream Test', function(){
    test('We can get at least 31 out', function(done){
        var gth = new GithubTimelineStream();
        var count = 0;
        var finished = false;

        this.timeout(15000);


        gth.pipe(through(function(){
                count++;
                if(count > 30 && !finished){
                    finished = true;
                    gth = null;
                    done();
                }

            })
        );

    });

    test('We dont get any dups', function(done){
        var gth = new GithubTimelineStream();

        var ids = {};
        var count= 0;
        var finished = false;

        this.timeout(15000);


        gth.on('data', function(data){
            count++;
            if(ids[data.id]){
                done("Found duplicate item!");
            }

            ids[data.id] = true;
            if(count > 30 && !finished){
                finished = true;
                done();
                gth = null;
            }
        });
    });
});
