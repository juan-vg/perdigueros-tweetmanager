var TwitterPackage = require('twitter');
var schedTweetsModel = require("./models/scheduled-tweets");
var twiAccModel = require("./models/twitter-accounts");
var userAccModel = require("./models/user-accounts");
var twStatsModel = require("./models/twitter-stats");

var twitterWorker = require("./twitter-worker.js");

var objectID = require('mongodb').ObjectID;
 
exports.tweetSchedulerUpdate = function(){
    
    console.log("TWEET-SCHEDULER: Start AT: " + new Date());
    
    tweetScheduler(function(err, data){
        if(!err){
            //console.log("TWEET-SCHEDULER: " + data);
        } else {
            //console.log("TWEET-SCHEDULER-ERROR: " + data);
        }
    });
};

exports.twitterAccountsCleaningUpdate = function(){
    
    console.log("TWIT-ACC-SCHEDULER: Start AT: " + new Date());
    
    twitterAccountsCleaning(function(err, data){
        if(!err){
            //console.log("TWIT-ACC-SCHEDULER: " + data);
        } else {
            //console.log("TWIT-ACC-SCHEDULER-ERROR: " + data);
        }
    });
};

exports.userAccountsCleaningUpdate = function(){
    
    console.log("USER-ACC-SCHEDULER: Start AT: " + new Date());
    
    userAccountsCleaning(function(err, data){
        if(!err){
            //console.log("USER-ACC-SCHEDULER: " + data);
        } else {
            //console.log("USER-ACC-SCHEDULER-ERROR: " + data);
        }
    });
};

function tweetScheduler(callback){

    var error, data;
    
    schedTweetsModel.find({"published":false, "publishDate": {$lte: new Date()}}, 
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    for(var i=0; i<dbData.length; i++){
                        
                        var tweetId = dbData[i]._id;
                        var text = dbData[i].text;
                        var twitterAccountId = dbData[i].twitterAccountId;

                        twiAccModel.find({"_id": new objectID(twitterAccountId)}, function(err, dbData2){
                            
                            if(!err){
                                
                                var info = dbData2[0].information;
                            
                                // create auth set
                                var secret = {
                                    consumer_key: info.consumerKey,
                                    consumer_secret: info.consumerSecret,
                                    access_token_key: info.accessToken,
                                    access_token_secret: info.accessTokenSecret
                                };
                                var Twitter = new TwitterPackage(secret);
                                
                                // publish tweet
                                Twitter.post('statuses/update', {status: text}, function(err, tweet, response){
                                    
                                    if(!err){
                                        
                                        // set scheduled tweet as published
                                        schedTweetsModel.update({"_id": new objectID(tweetId)},
                                            {$set: {"published":true}},
                                            function(err, res){
                                                if(!err){
                                                    error = false;
                                                    data = "Published";
                                                } else {
                                                    error = false;
                                                    data = "UPDATE ERROR";
                                                }
                                                callback(error, data);
                                            }
                                        );
                                    } else {
                                        console.log("TWEET-SCHEDULER: Twitter error: " + JSON.stringify(err));
                                                                              
                                        error = true;
                                        data = "TWITTER ERROR: " + err[0].message;
                                        callback(error, data);
                                    }
                                });
                            } else {
                                error = true;
                                data = "DB ERROR";
                                callback(error, data);
                            }
                        });
                    }
                } else {
                    error = false;
                    data = "NO SCHEDULED TWEETS";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
}

function twitterAccountsCleaning(callback){

    var error, data;
    
    twiAccModel.remove({"activated":false, "deactivationDate": {$lte: new Date()}}, 
        function(err, dbData){
            
            if(!err){
                error = false;
                data = null;
            } else{
                error = true;
                data = "DB ERROR";
            }
            
            callback(error, data);
        }
    );
}

function userAccountsCleaning(callback){

    var error, data;
    
    userAccModel.remove({"activated":false, "deactivationDate": {$lte: new Date()}}, 
        function(err, dbData){
            
            if(!err){
                error = false;
                data = null;
            } else{
                error = true;
                data = "DB ERROR";
            }
            
            callback(error, data);
        }
    );
}

exports.twitterStatsCleaning = function(){
    
    twStatsModel.distinct("tweetIdStr", function(err, dbData){
        if(!err){
            
            for(var i=0; i<dbData.length; i++){
                
                request("https://twitter.com/statuses/" + dbData[i].tweetIdStr, function(err,response,body) {
                    
                    if(!err){
                        
                        // if the tweet is no longer available -> remove from stats
                        if(response.request.href === "https://twitter.com/"){
                            twStatsModel.remove({tweetIdStr: this.tweetIdStr}, function(err, dbData2){});
                        }
                    }
                    
                }.bind(dbData[i]));
            }
        }
    });
}

exports.twitterLoader = function(){
    console.log("TWITER-LOADER: Start AT: " + new Date());
    twitterWorker.loadAccounts();
};

exports.twitterTracker = function(){
    console.log("TWITER-TRACKER: Start AT: " + new Date());
    twitterWorker.start();
}
