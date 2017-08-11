var tweetStatsModel = require("./models/tweet-stats");
var hashtagsModel = require("./models/hashtags");
var followedUsersModel = require("./models/followed-users");
var accVerificator = require('./account-verifications.js');
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;


var mockTweet = '{"created_at":"Fri Aug 11 16:30:26 +0000 2017","id":896046157243305984,"id_str":"896046157243305984","text":"this is a tweet test","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[]},"source":"\u003ca href=\"http:\/\/twitter.com\" rel=\"nofollow\"\u003eTwitter Web Client\u003c\/a\u003e","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":808011183794126848,"id_str":"808011183794126848","name":"Juan Vela","screen_name":"JuanVelaG","location":"","description":"","url":null,"entities":{"description":{"urls":[]}},"protected":false,"followers_count":1,"friends_count":2,"listed_count":0,"created_at":"Sun Dec 11 18:10:53 +0000 2016","favourites_count":0,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":1,"lang":"es","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"F5F8FA","profile_background_image_url":null,"profile_background_image_url_https":null,"profile_background_tile":false,"profile_image_url":"http:\/\/pbs.twimg.com\/profile_images\/808012667554242562\/BFT8Z-5M_normal.jpg","profile_image_url_https":"https:\/\/pbs.twimg.com\/profile_images\/808012667554242562\/BFT8Z-5M_normal.jpg","profile_link_color":"1DA1F2","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":false,"follow_request_sent":false,"notifications":false,"translator_type":"none"},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"lang":"en"}';


exports.get = function(token, callback){
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
			
			tweetLikes(data, callbackFunc);
			tweetRetweets(data, callbackFunc);
            
			tweetLikesPerMonth(data, callbackFunc);
			tweetRetweetsPerMonth(data, callbackFunc);
            
			tweetLikesPerDay(data, callbackFunc);
			tweetRetweetsPerDay(data, callbackFunc);
            
			tweetsPerDay(data, callbackFunc);
            
			accFollowers(data, callbackFunc);
            
			hashtags(data, callbackFunc);
			followed(data, callbackFunc);

		} else {
			error = true;
			data = "FORBIDDEN";

			callback(error, data);
		}
	});
};

function tweetLikes(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikes: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikes = result;
    callback(error);
}

function tweetRetweets(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweets: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweets = result;
    callback(error);
}

function tweetLikesPerMonth(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikesPerMonth: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikesPerMonth = result;
    callback(error);
}

function tweetRetweetsPerMonth(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweetsPerMonth: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweetsPerMonth = result;
    callback(error);
}

function tweetLikesPerDay(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetLikesPerDay: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetLikesPerDay = result;
    callback(error);
}

function tweetRetweetsPerDay(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetRetweetsPerDay: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            tweet: mockTweet,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.tweetRetweetsPerDay = result;
    callback(error);
}

function tweetsPerDay(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-tweetsPerDay: Stats obtained");
    
    error = false;
    
	for(var i=0; i<23; i++){
        
        var entry = {
            day: i+1,
            count: Math.floor((Math.random() * 100) + 1)
        };
        result.push(entry);
    }
    
    resData.tweetsPerDay = result;
    callback(error);
}

function accFollowers(resData, callback){
	// MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-accFollowers: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            accId: 'ptm-twitter-account-id-' + i,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.accFollowers = result;
    callback(error);
}

function hashtags(resData, callback){
	var error, result = [];
    
    hashtagsModel.aggregate([
        { $group:{_id:{'hashtag' : "$hashtag"}, count:{ $sum: 1}}},
        { $sort:{count:-1}},
        { $limit: 10}
        ],  function(err, data) {
            
            if(!err){
                console.log("USER-STATS-hashtags: Stats obtained");
                  
                error = false;
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        hashtag: data[i]._id.hashtag,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
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

function followed(resData, callback){
    
    // MOCKUP
    
    var error, result = [];
    
    console.log("USER-STATS-followed: Stats obtained");
    
    error = false;
    
	for(var i=0; i<10; i++){
        
        var entry = {
            userId: 'twitter-username-' + i,
            count: 100-i
        };
        result.push(entry);
    }
    
    resData.followed = result;
    callback(error);
}
