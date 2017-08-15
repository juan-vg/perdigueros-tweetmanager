var twAccModel = require("./models/twitter-accounts");
var usersModel = require("./models/user-accounts");
var twStatsModel = require("./models/twitter-stats");
var twWorkerModel = require("./models/twitter-worker");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;
const BigInteger = require('./utilities/biginteger').BigInteger;


var mongoose = require("mongoose");
//database connection
mongoose.connect('mongodb://localhost:27017/ptm');


// global vars & consts

// number of tweets to retrieve on every Twitter API request
const COUNT = 20;

// number of accounts analyzed at the same time (same thread)
const LIMIT = 50;



exports.loadAccounts = function(){
    
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

function start(ini){

    twWorkerModel.find({}, {}, { skip: ini, limit: LIMIT }, function(err, dbData){
        if(!err){
            
            var count = dbData.length-1;
            var data = JSON.parse(JSON.stringify(dbData));
            
            var callbackFunc = function(){
                
                if(count == 0){
                    twitterWorker(data);
                } else {
                    count--;
                }
            };

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
        
        // recursive call
        if(dbData.length == LIMIT){
            start(ini + LIMIT);
        }
    });
}
module.exports.start = start;


function twitterWorker(dbData){
    
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
        
        
        var query;
        var data = dbData[i];
        
        if(data.action === "ready"){
            query = {'count': COUNT};
            
            // set working
            twWorkerModel.update({'_id': data._id}, {$set: {action: "working"}}, function(err, dbData2){
                if(!err){
                    twitterReqWorker(data, Twitter, favorites, retweets, query);
                } else {
                    console.log("TWITTER-WORKER-TW-WORKER: DB ERROR (twWorker)");
                }
            });
            
        } else {
            var max_id = BigInteger(data.oldestTweetId);
            max_id = max_id.subtract(1);
            query = {'count': COUNT, 'max_id': max_id.toString()};
            
            twitterReqWorker(data, Twitter, favorites, retweets, query);
        }
    }
}
//module.exports.worker = worker;



function twitterReqWorker(dbData, Twitter, favorites, retweets, query){
    
    Twitter.get('statuses/home_timeline', query, function(err, body){
        
        if(!err){

            
            
            for(var i=0; i<body.length; i++){

                favorites.set(body[i].id_str, body[i].favorite_count);
                retweets.set(body[i].id_str, body[i].retweet_count);
            }
            
            //save stats
            
            //save worker progress?
            
            //nueva query
            //count = body.length;
            // si count < COUNT preparar query para recorrer la parte superior del timeline
            // si no, seguir bajando
            
            
            //twitterReqWorker(dbData, Twitter, favorites, retweets, query)
            
        } else {
            // rate limit
            
            
            // save stats?
            // save worker progress
        }
    });
}

exports.saveStats = function(){
    
    
};
// stats agregate
// db.twitterstats.aggregate([{$match: {userId:"1", tweetIdStr:"1"}}, {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }, 'day':{ $dayOfMonth: "$date"}}, count: {$sum: '$favorites'}}},{$sort:{ _id:1 }}])
// db.twitterstats.aggregate([{$match: {userId:"1", tweetIdStr:"1"}}, {$group:{'_id': '', count: {$sum: '$favorites'}}},{$sort:{ _id:1 }}])
