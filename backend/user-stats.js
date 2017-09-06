var tweetStatsModel = require("./models/tweet-stats");
var twitterStatsModel = require("./models/twitter-stats");
var twitterAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");
var followedUsersModel = require("./models/followed-users");
var usersModel = require("./models/user-accounts");
var accVerificator = require('./account-verifications.js');
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;

exports.get = function(token, callback){
    var error, data;
    
    var accountID = {
        token: token,
        lookingForEmail: true
    };

    // check the token and the userId
    accVerificator.verifyUser(accountID, function(success, reason){

        if(success){
            
            var email = reason;
            
            data = { 
                "tweetLikes" : {},
                "tweetRetweets" : {},
                
                "tweetLikesPerMonth" : {},
                "tweetRetweetsPerMonth" : {},
                
                "tweetLikesPerDay" : {},
                "tweetRetweetsPerDay" : {},

                "tweetsPerDay" : {},
                
                "accFollowers" : {},
                
                "hashtags" : {},
                "followed" : {}
            };
            error = false;

            var count = Object.keys(data).length-1;
            
            var callbackFunc = function(err){
                
                if(err){
                    error = true;
                }
                
                if(count == 0){
                    callback(error, data);
                } else {
                    count--;
                }
            };
            
            tweetLikes(data, email, callbackFunc);
            tweetRetweets(data, email, callbackFunc);
            
            tweetLikesPerMonth(data, email, callbackFunc);
            tweetRetweetsPerMonth(data, email, callbackFunc);
            
            tweetLikesPerDay(data, email, callbackFunc);
            tweetRetweetsPerDay(data, email, callbackFunc);
            
            tweetsPerDay(data, email, callbackFunc);
            
            accFollowers(data, email, callbackFunc);
            
            hashtags(data, callbackFunc);
            followed(data, callbackFunc);

        } else {
            error = true;
            data = "FORBIDDEN";

            callback(error, data);
        }
    });
};

// Top 10 tweets having more likes
function tweetLikes(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var query;
            if(email === "ADMIN"){
                query = {};
            } else {
                query = {userId: dbData[0]._id.toString()};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$favorites'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetLikes: Stats obtained");
                        resData.tweetLikes = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetLikes: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetLikes = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetLikes: Not Found");
            } else {
                console.log("USER-STATS-tweetLikes: DB Error (Users)");
            }

            error = true;
            resData.tweetLikes = [];
            callback(error);
        }
    });
}

// Top 10 tweets having more retweets
function tweetRetweets(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var query;
            if(email === "ADMIN"){
                query = {};
            } else {
                query = {userId: dbData[0]._id.toString()};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$retweets'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetRetweets: Stats obtained");
                        resData.tweetRetweets = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetRetweets: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetRetweets = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetRetweets: Not Found");
            } else {
                console.log("USER-STATS-tweetRetweets: DB Error (Users)");
            }

            error = true;
            resData.tweetRetweets = [];
            callback(error);
        }
    });
}

// Top 10 tweets having more likes in the current month
function tweetLikesPerMonth(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            
            // get the first day and the first hour and minute from the current month
            var minDate = new Date();
            minDate = new Date(minDate.setUTCHours(0,0,0,0));
            minDate = new Date(minDate.setUTCDate(1));
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate, $gte: minDate}};
            } else {
                query = {userId: dbData[0]._id.toString(), "date": {$lte: maxDate, $gte: minDate}};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$favorites'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetLikesPerMonth: Stats obtained");
                        resData.tweetLikesPerMonth = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetLikesPerMonth: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetLikesPerMonth = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetLikesPerMonth: Not Found");
            } else {
                console.log("USER-STATS-tweetLikesPerMonth: DB Error (Users)");
            }

            error = true;
            resData.tweetLikesPerMonth = [];
            callback(error);
        }
    });
}

// Top 10 tweets having more retweets in the current month
function tweetRetweetsPerMonth(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            
            // get the first day and the first hour and minute from the current month
            var minDate = new Date();
            minDate = new Date(minDate.setUTCHours(0,0,0,0));
            minDate = new Date(minDate.setUTCDate(1));
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate, $gte: minDate}};
            } else {
                query = {userId: dbData[0]._id.toString(), "date": {$lte: maxDate, $gte: minDate}};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$retweets'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetRetweetsPerMonth: Stats obtained");
                        resData.tweetRetweetsPerMonth = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetRetweetsPerMonth: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetRetweetsPerMonth = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetRetweetsPerMonth: Not Found");
            } else {
                console.log("USER-STATS-tweetRetweetsPerMonth: DB Error (Users)");
            }

            error = true;
            resData.tweetRetweetsPerMonth = [];
            callback(error);
        }
    });
}

// Top 10 tweets having more likes in the current day
function tweetLikesPerDay(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            
            // get the first hour and minute from the current day
            var minDate = new Date();
            minDate = new Date(minDate.setUTCHours(0,0,0,0));
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate, $gte: minDate}};
            } else {
                query = {userId: dbData[0]._id.toString(), "date": {$lte: maxDate, $gte: minDate}};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$favorites'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetLikesPerDay: Stats obtained");
                        resData.tweetLikesPerDay = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetLikesPerDay: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetLikesPerDay = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetLikesPerDay: Not Found");
            } else {
                console.log("USER-STATS-tweetLikesPerDay: DB Error (Users)");
            }

            error = true;
            resData.tweetLikesPerDay = [];
            callback(error);
        }
    });
}

// Top 10 tweets having more retweets in the current day
function tweetRetweetsPerDay(resData, email, callback){
    
    var error, result = [];
    
    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            
            // get the first hour and minute from the current day
            var minDate = new Date();
            minDate = new Date(minDate.setUTCHours(0,0,0,0));
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate, $gte: minDate}};
            } else {
                query = {userId: dbData[0]._id.toString(), "date": {$lte: maxDate, $gte: minDate}};
            }
            
            twitterStatsModel.aggregate([
                {$match: query}, 
                {$group:{'_id': {tweetId: '$tweetIdStr'}, count: {$sum: '$retweets'}}},
                {$sort:{ count:-1 }},{ $limit: 10}],
                function(err, dbData2){
                    
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                tweet: {
                                        id_str: dbData2[i]._id.tweetId
                                },
                                count: dbData2[i].count
                            };
                            
                            if(entry.count > 0){
                                result.push(entry);
                            }
                        }
                        
                        console.log("USER-STATS-tweetRetweetsPerDay: Stats obtained");
                        resData.tweetRetweetsPerDay = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetRetweetsPerDay: DB Error (TwitterStats)");
                    
                        error = true;
                        resData.tweetRetweetsPerDay = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetRetweetsPerDay: Not Found");
            } else {
                console.log("USER-STATS-tweetRetweetsPerDay: DB Error (Users)");
            }

            error = true;
            resData.tweetRetweetsPerDay = [];
            callback(error);
        }
    });
}

// Number of tweets per day in the current month (from the first day)
function tweetsPerDay(resData, email, callback){
    
    var error, result = [];

    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            
            // get the first day and the first hour and minute from the current month
            var minDate = new Date();
            minDate = new Date(minDate.setUTCHours(0,0,0,0));
            minDate = new Date(minDate.setUTCDate(1));
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate, $gte: minDate}};
            } else {
                query = {userId: dbData[0]._id.toString(), "date": {$lte: maxDate, $gte: minDate}};
            }
            
            tweetStatsModel.aggregate([
                {$match: query},
                {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }, 'day':{ $dayOfMonth: "$date"}}, count: {$sum:1}}},
                {$sort:{ _id:1 }}], function(err, dbData2){
                    if(!err){
                        for(var i=0; i<dbData2.length; i++){
                            var entry = {
                                day: dbData2[i]._id.day,
                                count: dbData2[i].count
                            };
                            result.push(entry);
                        }
                        
                        console.log("USER-STATS-tweetsPerDay: Stats obtained");
                        resData.tweetsPerDay = result;
                        callback(error);
                        
                    } else {
                        console.log("USER-STATS-tweetsPerDay: DB Error (TweetStats)");
                    
                        error = true;
                        resData.tweetsPerDay = [];
                        callback(error); 
                    }
                });
            
        } else {
            
            if(!err) {
                console.log("USER-STATS-tweetsPerDay: Not Found");
            } else {
                console.log("USER-STATS-tweetsPerDay: DB Error (Users)");
            }

            error = true;
            resData.tweetsPerDay = [];
            callback(error);
        }
    });
}

// Top 10 twitter accounts having more followers
function accFollowers(resData, email, callback){
    
    var error, result = [];

    error = false;
    
    var query;
    if(email === "ADMIN"){
        query = {activated: true};
    } else {
        query = {email: email, activated: true};
    }
    
    twitterAccModel.find(query, function(err, dbData){
        if(!err){
            
            // callback func -> wait for all requests
            var count = dbData.length-1;
            var callbackFunc = function(err){
                
                if(err){
                    error = true;
                }
                
                if(count == 0){
                    
                    // sort array
                    function compare(a,b) {
                      if (a.count < b.count)
                        return 1;
                      if (a.count > b.count)
                        return -1;
                      return 0;
                    }
                    result.sort(compare);
                    
                    console.log("USER-STATS-accFollowers: Stats obtained");
                    resData.accFollowers = result;
                    callback(error);
                    
                } else {
                    count--;
                }
            };
            
            // twitter requests for all twitter accounts
            for (var i=0; i<dbData.length; i++){

                // create auth set
                var secret = {
                    consumer_key: dbData[i].information.consumerKey,
                    consumer_secret: dbData[i].information.consumerSecret,
                    access_token_key: dbData[i].information.accessToken,
                    access_token_secret: dbData[i].information.accessTokenSecret
                };
                var Twitter = new TwitterPackage(secret);
                
                Twitter.get('users/show', {screen_name: dbData[i].name}, function(err, response){
                    
                    var twErr;
                    
                    if(!err){
                        
                        var entry = {
                            accId: this._id,
                            count: response.followers_count
                        };
                        result.push(entry);
                        
                        twErr = false;
                        callbackFunc(twErr);
                        

                    } else {
                        console.log("USER-STATS-accFollowers: Twitter Error (" + JSON.stringify(err) + ")");
                        
                        twErr = true;
                        callbackFunc(twErr);
                    }
                    
                }.bind(dbData[i]));
            }
            
        } else {
            console.log("USER-STATS-accFollowers: DB Error");
            
            error = true;
            resData.accFollowers = [];
            callback(error);
        }
    });
}

// Top 10 hashtags most used in the PTM app
function hashtags(resData, callback){
    var error, result = [];
    
    hashtagsModel.aggregate([
        { $group:{_id:{'hashtag' : "$hashtag"}, count:{ $sum: 1}}},
        { $sort:{count:-1}},
        { $limit: 10}
        ],  function(err, data) {
            
            if(!err){

                error = false;
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        hashtag: data[i]._id.hashtag,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
                console.log("USER-STATS-hashtags: Stats obtained");
                resData.hashtags = result;
                callback(error);
                
            } else {
                console.log("USER-STATS-hashtags: Error");
                    
                error = true;
                resData.hashtags = [];
                callback(error);
            }
    });
}

// Top 10 followed-users most used in the PTM app
function followed(resData, callback){
    
    var error, result = [];
    
    followedUsersModel.aggregate([
        { $group:{_id:{'user' : "$user"}, count:{ $sum: 1}}},
        { $sort:{count:-1}},
        { $limit: 10}
        ],  function(err, data) {
            
            if(!err){

                error = false;
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        followed: data[i]._id.user,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
                console.log("USER-STATS-followed: Stats obtained");
                resData.followed = result;
                callback(error);
                
            } else {
                console.log("USER-STATS-followed: Error");
                    
                error = true;
                resData.followed = [];
                callback(error);
            }
    });
}
