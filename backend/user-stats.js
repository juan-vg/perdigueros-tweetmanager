var tweetStatsModel = require("./models/tweet-stats");
var accVerificator = require('./account-verifications.js');
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;


exports.get= function(token, callback){
    var error, data;
    
    var accountID = {
		token: token,
		lookingForEmail: true
	};

	// check the token and the userId
	accVerificator.verifyUser(accountID, function(success, reason){

		if(success){
			
			data = { 
				"tweetLikes" : {},
				"accLikesPerTweet" : {},
				"tweetRetweets" : {},
				"hashtags" : {},
				"followed" : {},
				"accLikes" : {},
				"accTweetsPerDay" : {},
				"accTweetsPerMonth" : {},
				"accFollowersPerDay" : {},
				"accFollowersPerMonth" : {}
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
			
			tweetLikes(data, callbackFunc);
			accLikesPerTweet(data, callbackFunc);
			tweetRetweets(data, callbackFunc);
			hashtags(data, callbackFunc);
			followed(data, callbackFunc);
			accLikes(data, callbackFunc);
			accTweetsPerDay(data, callbackFunc);
			accTweetsPerMonth(data, callbackFunc);
			accFollowersPerDay(data, callbackFunc);
			accFollowersPerMonth(data, callbackFunc);

		} else {
			error = true;
			data = "FORBIDDEN";

			callback(error, data);
		}
	});
	});
};

function tweetLikes(data, callback){
	
}

function accLikesPerTweet(data, callback){
	
}

function tweetRetweets(data, callback){
	
}

function hashtags(data, callback){
	var error, result = [];
    
    tweetStatsModel.aggregate([
		{ $match: },
        { $group:{_id:{'userId' : "$userId"}, count:{ $sum: 1}}},
        { $sort:{count:-1}},
        { $limit: 10}
        ],  function(err, data) {
            
            if(!err){
                console.log("ADMIN-STATS-ResByUSER: Stats obtained");
                  
                error = false;
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        userId: data[i]._id.userId,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
                results.byCountry = result;
                callback(error);
                
            } else {
                console.log("ADMIN-STATS-ResByUSER: Error");
                    
                error = true;
                results.byUser = [];
                callback(error);
            }
    });
}

function followed(data, callback){
	
}

function accLikes(data, callback){
	
}

function accTweetsPerDay(data, callback){
	
}

function accTweetsPerMonth(data, callback){
	
}

function accFollowersPerDay(data, callback){
	
}

function accFollowersPerMonth(data, callback){
	
}
