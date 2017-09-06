var twAccModel = require("./models/twitter-accounts");
var usersModel = require("./models/user-accounts");
var twStatsModel = require("./models/twitter-stats");
var twWorkerModel = require("./models/twitter-worker");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;
const BigInteger = require('./utilities/biginteger').BigInteger;
var HashMap = require('hashmap');
var request = require('request');

// global vars & consts

// number of tweets to retrieve on every Twitter API request
const COUNT = 20;

// number of requests to be made to the Twitter API
const REQ_COUNT = 5;

// number of accounts analyzed at the same time (same thread)
const LIMIT = 50;


function loadAccounts(){
    
    // get all tracked twitter account ids
    twWorkerModel.find({}, {accId:1, _id:0}, function(err, dbData){
        if(!err){
            
            var ids = dbData.map(function(data) { return new objectID(data.accId); });
            
            // get NOT tracked twitter accounts
            twAccModel.find({_id:{$not:{$in:ids}}}, {_id:1, email:1}, function(err, dbData){

                if(!err){
                    
                    for(var i=0; i<dbData.length; i++){
                        
                        usersModel.find({email: dbData[i].email}, {_id:1}, function(err, dbData){
                            
                            if(!err && dbData.length > 0){
                                
                                var dbWorker = new twWorkerModel();
                                dbWorker.userId = dbData[0]._id;
                                dbWorker.accId = this._id;
                                dbWorker.action = "ready";
                                dbWorker.newestTweetId = -1;
                                dbWorker.oldestTweetId = -1;
                                
                                dbWorker.save(function(err, dbData){
                                    if(err){
                                        console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twWorker-save)");
                                    }
                                });
                                
                            } else {
                                console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (users)");
                            }
                            
                        }.bind(dbData[i]));
                    }
                    
                } else {
                    console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twAcc)");
                }
            });
        } else {
            console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twWorker-find)");
        }
    });
}
module.exports.loadAccounts = loadAccounts;


function start(ini){
    
    if(!ini){
        ini = 0;
    }
    
    //console.log("TWITTER-WORKER-START");

    // get batch
    twWorkerModel.find({}, {}, { skip: ini, limit: LIMIT }, function(err, dbData){
        if(!err){
            
            var count = dbData.length-1;
            
            // parse From mongoose schema To JSON
            var data = JSON.parse(JSON.stringify(dbData));
            
            // CALLBACK -> send batch to async worker
            var callbackFunc = function(){
                
                if(count == 0){
                    twitterWorker(data);
                } else {
                    count--;
                }
            };
            
            // get Twitter credentials
            for (var i=0; i<dbData.length; i++){
                
                data[i].info = {};
                
                twAccModel.find({_id: new objectID(dbData[i].accId)}, {information:1}, function(err, dbData2){
                    
                    if(!err && dbData2.length > 0){
                        this.info = dbData2[0].information;
                    } else {
                        console.log("TWITTER-WORKER-START: DB ERROR (twAcc)");
                    }
                    callbackFunc();
                    
                }.bind(data[i]));
            }
            
        } else {
            console.log("TWITTER-WORKER-START: DB ERROR (twWorker)");
        }
        
        // If there are more entries in DB -> recursive call -> get another batch
        if(dbData.length == LIMIT){
            //console.log("TWITTER-WORKER-START: Recursive call");
            start(ini + LIMIT);
        }
    });
}
module.exports.start = start;


function twitterWorker(dbData){
    
    //console.log("TWITTER-WORKER-TW-WORKER: Num Acc: " + dbData.length);
    
    // for each twitter account
    for (var i=0; i<dbData.length; i++){
        
        var favorites = new HashMap();
        var retweets = new HashMap();
        
        // create auth set
        var secret = {
            consumer_key: dbData[i].info.consumerKey,
            consumer_secret: dbData[i].info.consumerSecret,
            access_token_key: dbData[i].info.accessToken,
            access_token_secret: dbData[i].info.accessTokenSecret
        };
        var Twitter = new TwitterPackage(secret);
        
        
        // make Twitter query
        var query;
        var data = dbData[i];
        
        if(data.action === "ready"){
            query = {'count': COUNT};
            data.action = "working";
            
        } else {
            // worker has not finished last time
            
            if(data.newestTweetId !== "-1" && data.newestTweetId === "-1"){
                
                // going up
                var since_id = BigInteger(data.newestTweetId);
                since_id = since_id.add(1);
                query = {'count': COUNT, 'since_id': since_id.toString()};
                
            } else {
                
                // going down
                var max_id = BigInteger(data.oldestTweetId);
                max_id = max_id.subtract(1);
                query = {'count': COUNT, 'max_id': max_id.toString()};
            }

        }
        
        // send batch to Req-Worker
        var numReq = 0;
        twitterReqWorker(data, Twitter, favorites, retweets, query, numReq);
    }
}

function twitterReqWorker(dbData, Twitter, favorites, retweets, query, numReq){
    
    // max REQ_COUNT recursive calls
    if(numReq < REQ_COUNT){
        
        // get tweet batch
        Twitter.get('statuses/user_timeline', query, function(err, body){
            
            if(!err){
                
                // save data avoiding repeated tweet IDs (fixes Twitter API error)
                for(var i=0; i<body.length; i++){
                    
                    if(body[i].retweeted_status){
                        favorites.set(body[i].id_str, body[i].retweeted_status.favorite_count);
                        retweets.set(body[i].id_str, body[i].retweeted_status.retweet_count);
                    } else {
                        favorites.set(body[i].id_str, body[i].favorite_count);
                        retweets.set(body[i].id_str, body[i].retweet_count);
                    }
                }

                count = body.length;
                var progress = {action: "working"};
                
                if(count > 0){
                    //save stats
                    saveStats(dbData, favorites, retweets);
                    
                    // if first iteration -> save top tweet id
                    if(dbData.oldestTweetId === "-1" && dbData.newestTweetId === "-1"){
                        
                        dbData.newestTweetId = body[0].id_str;
                        progress.newestTweetId = body[0].id_str;
                        
                        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> First");
                    }
                }
                
                /////////////////////////
                // If !query.max_id && !query.since_id && count < COUNT -> start going up
                // else If !query.max_id && !query.since_id -> keep going down -> lastId = body[body.length].id_str;
                
                // If query.max_id && count < COUNT -> start going up
                // else If query.max_id, keep going down -> lastId = body[body.length].id_str;
                
                // If query.since_id && count < COUNT -> Job end -> action: ready
                // else If query.since_id, keep going up -> lastId = body[0].id_str;
                /////////////////////////
                
                
                // if it is the end of the timeline
                if(count < COUNT){
                    
                    if(!query.since_id && dbData.newestTweetId !== "-1"){
                        //start going up
                        
                        delete query["max_id"];
                        
                        var since_id = BigInteger(dbData.newestTweetId);
                        since_id = since_id.add(1);
                        query.since_id = since_id.toString();
                        
                        dbData.oldestTweetId = "-1";
                        progress.oldestTweetId = "-1";
                        
                        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> Start up");

                    } else {
                        // change to ready status
                        progress.action = "ready";
                        progress.newestTweetId = "-1";
                        progress.oldestTweetId = "-1";
                        
                        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> Finish");
                    }
                    
                } else {
                    
                    if(!query.since_id){
                        
                        //keep going down -> lastId = body[body.length-1].id_str;
                        var max_id = BigInteger(body[body.length-1].id_str);
                        max_id = max_id.subtract(1);
                        query.max_id = max_id.toString();
                        
                        dbData.oldestTweetId = body[body.length-1].id_str;
                        progress.oldestTweetId = body[body.length-1].id_str;
                        
                        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> Keep down");
                        
                    } else {
                        
                        //keep going up -> lastId = body[0].id_str;
                        var since_id = BigInteger(body[0].id_str);
                        since_id = since_id.add(1);
                        query.since_id = since_id.toString();
                        
                        dbData.newestTweetId = body[0].id_str;
                        progress.newestTweetId = body[0].id_str;
                        
                        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> Keep up");
                    }
                }
                
                //save worker progress
                twWorkerModel.update({'_id': dbData._id}, {$set: progress}, function(err, dbData2){
                    if(err){
                        console.log("TWITTER-WORKER-TW-REQ-WORKER: DB ERROR (twWorker)");
                    }
                });
                
                
                // recursive call
                if(progress.action !== "ready"){
                    //console.log("TWITTER-WORKER-TW-REQ-WORKER: Recursive call");
                    twitterReqWorker(dbData, Twitter, favorites, retweets, query, numReq+1);
                }
                
                
            } else {
                // Twitter rate limit? -> stop
                //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> LIMIT : " + JSON.stringify(err));
            }
        });
    } else {
        //console.log("TWITTER-WORKER-TW-REQ-WORKER: Acc ID: " + dbData.accId + " -> RECURSION LIMIT");
    }
}

function saveStats(dbData, favorites, retweets){
    
    // for each tweet
    favorites.forEach(function(favs, id_str){
        
        // check if tweet is public and exists (ng-tweet compatible)
        request("https://twitter.com/statuses/" + id_str, function(err,response,body) {
            
            if(!err){
                
                // only save stats if the tweet is public and exists (ng-tweet compatible)
                if(response.request.href !== "https://twitter.com/"){
                    
                    var retws = retweets.get(id_str);
                    
                    // get last (total) values
                    twStatsModel.aggregate([
                        {$match: {userId: dbData.userId, tweetIdStr: id_str}}, 
                        {$group:{'_id': '', countfavs: {$sum: '$favorites'}, countretws: {$sum: '$retweets'}}}], 
                        
                        function(err, dbData2){
                            
                            if(!err){
                                
                                // if there is previous data
                                if(dbData2.length > 0){
                                    
                                    // get diff
                                    favs = favs - dbData2[0].countfavs;
                                    retws = retws - dbData2[0].countretws;
                                }
                                
                                // if there is data
                                if(favs != 0 || retws != 0){
                                    
                                    // insert
                                    var db = new twStatsModel();
                                    db.userId = dbData.userId;
                                    db.tweetIdStr = id_str;
                                    db.favorites = favs;
                                    db.retweets = retws;
                                    db.date = new Date();
                                    
                                    db.save(function(err, dbData2){
                                        if(err){
                                            console.log("TWITTER-WORKER-SAVE-STATS: DB ERROR (twStats-save)");
                                        }
                                    });
                                }
                                
                            } else {
                                console.log("TWITTER-WORKER-SAVE-STATS: DB ERROR (twStats-aggregate)");
                            }
                        }
                    );
                }
            } else {
                console.log("TWITTER-WORKER-SAVE-STATS: REQ ERROR");
            }
        });
    });
}
