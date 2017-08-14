var tweetStatsModel = require("./models/tweet-stats");
var twitterAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");
var followedUsersModel = require("./models/followed-users");
var usersModel = require("./models/user-accounts");
var accVerificator = require('./account-verifications.js');
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;


var mockTweet = '{"created_at":"Fri Aug 11 16:30:26 +0000 2017","id":896046157243305984,"id_str":"896046157243305984","text":"this is a tweet test","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[]},"source":"\u003ca href=\\\"http:\/\/twitter.com\\\" rel=\\\"nofollow\\\"\u003eTwitter Web Client\u003c\/a\u003e","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":808011183794126848,"id_str":"808011183794126848","name":"Juan Vela","screen_name":"JuanVelaG","location":"","description":"","url":null,"entities":{"description":{"urls":[]}},"protected":false,"followers_count":1,"friends_count":2,"listed_count":0,"created_at":"Sun Dec 11 18:10:53 +0000 2016","favourites_count":0,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":1,"lang":"es","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"F5F8FA","profile_background_image_url":null,"profile_background_image_url_https":null,"profile_background_tile":false,"profile_image_url":"http:\/\/pbs.twimg.com\/profile_images\/808012667554242562\/BFT8Z-5M_normal.jpg","profile_image_url_https":"https:\/\/pbs.twimg.com\/profile_images\/808012667554242562\/BFT8Z-5M_normal.jpg","profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":false,"follow_request_sent":false,"notifications":false,"translator_type":"none"},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"lang":"en"}';


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
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikes: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikes = result;
    callback(error);
}

// Top 10 tweets having more retweets
function tweetRetweets(resData, email, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweets: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweets = result;
    callback(error);
}

// Top 10 tweets having more likes in the current month
function tweetLikesPerMonth(resData, email, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikesPerMonth: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikesPerMonth = result;
    callback(error);
}

// Top 10 tweets having more retweets in the current month
function tweetRetweetsPerMonth(resData, email, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweetsPerMonth: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweetsPerMonth = result;
    callback(error);
}

// Top 10 tweets having more likes in the current day
function tweetLikesPerDay(resData, email, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikesPerDay: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikesPerDay = result;
    callback(error);
}

// Top 10 tweets having more retweets in the current day
function tweetRetweetsPerDay(resData, email, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweetsPerDay: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: JSON.parse(mockTweet),
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweetsPerDay = result;
    callback(error);
}

// Number of tweets per day in the current month (from the first day)
function tweetsPerDay(resData, email, callback){
    
    var error, result = [];

    error = false;
    
    usersModel.find({email: email}, function(err, dbData){
        if(!err && (dbData.length > 0 || email === "ADMIN")){
            
            var maxDate = new Date();
            var minDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
            
            var query;
            if(email === "ADMIN"){
                query = {"date": {$lte: maxDate}, "date": {$gte: minDate}};
            } else {
                query = {userId: dbData[0]._id, "date": {$lte: maxDate}, "date": {$gte: minDate}};
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
