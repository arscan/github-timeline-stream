'use strict';

var GithubTimelineStream = require('../lib/GithubTimelineStream.js');

suite('Stream Test', function(){
    test('We can get at least 50 out', function(done){
        var gth = new GithubTimelineStream();
        var count = 0;
        var finished = false;

        this.timeout(10000);


        gth.on('data', function(data){
            console.log(data);
            count++;
            if(count > 50 && !finished){
                finished = true;
                done();
            }
        });
    
    });
});
