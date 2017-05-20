var userAccModel = require("./models/user-accounts");
var loginStatsModel = require("./models/login-stats");
var regsDownsModel = require("./models/regs-downs-stats");
var tweetStatsModel = require("./models/tweet-stats");;
var accVerificator = require('./account-verifications.js');

// STATS STORE

// Save the last accesses in the system
exports.saveLastAccess = function(lastAccess){
    
    storeLastAccessStats(lastAccess, function(err, data){
        if(!err){
            //ignore
        } else {
            //ignore
        }
    });
};

function storeLastAccessStats(lastAccess, callback){
    
    var dbLoginStats = new loginStatsModel();
    dbLoginStats.date = lastAccess; 
    
    dbLoginStats.save(function(err, res){
        if(!err) {

            console.log("ADMIN-STATS-STORE-LAST-ACCESS: Stored new login.");

            error = false;
            data = null;
        } else {
            console.log("ADMIN-STATS-STORE-LAST-ACCESS: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
    });
}

// Save the registries in the system 
exports.saveRegistry = function(firstAccess){
    
    storeRegistryStats(firstAccess, function(err, data){
        if(!err){
            //ignore
        } else {
            //ignore
        }
    });
};

function storeRegistryStats(firstAccess, callback){
    
    var dbRegStats = new regsDownsModel();
    dbRegStats.date = firstAccess;
    dbRegStats.regDown = true;
    
    dbRegStats.save(function(err, res){
        if(!err) {

            console.log("ADMIN-STATS-STORE-REGISTRY: Stored new registration.");

            error = false;
            data = null;
        } else {
            console.log("ADMIN-STATS-STORE-REGISTRY: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
    });
}

// Save the downs in the system
exports.saveDown = function(access){
    
    storeDownStats(access, function(err, data){
        if(!err){
            //ignore
        } else {
            //ignore
        }
    });
};

function storeDownStats(access, callback){
    
    var dbRegStats = new regsDownsModel();
    dbRegStats.date = access;
    dbRegStats.regDown = false;
    
    dbRegStats.save(function(err, res){
        if(!err) {

            console.log("ADMIN-STATS-STORE-DOWN: Stored new down.");

            error = false;
            data = null;
        } else {
            console.log("ADMIN-STATS-STORE-DOWN: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
    });
}

// Save the last accesses in the system
exports.saveTweet = function(tweetData){
    
    storeTweetStats(tweetData, function(err, data){
        if(!err){
            //ignore
        } else {
            //ignore
        }
    });
};

function storeTweetStats(tweetData, callback){
    
    var dbTweetStats = new tweetStatsModel();
    dbTweetStats.date = tweetData.date;
    dbTweetStats.country = tweetData.country; 
    dbTweetStats.userId = tweetData.userId; 
    
    dbTweetStats.save(function(err, res){
        if(!err) {

            console.log("ADMIN-STATS-STORE-TWEET: Stored new tweet.");

            error = false;
            data = null;
        } else {
            console.log("ADMIN-STATS-STORE-TWEET: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
    });
}


// STATS PROC

function groupBy(array, callback){

    var result = {};
    var number = 0;
    
    // group by year and month, and limit to 12 months
    for(var i = 0; i < array.length && number <= 11 ; i++){
        var year = array[i]._id.year;
        if(!result[year]){
            result[year] = [];
        }
        result[year].push({ month: array[i]._id.month, data: array[i].count});
        number += array[i].count;
    }
    callback(result); 
}

function upsStats(data, callback){
    
    var error;
    
    // REGISTRATION DATES
    regsDownsModel.aggregate([
        {$match:{'regDown':true}},
        {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}}
        ], function(errReg, regs){
            if(!errReg) {
                console.log("ADMIN-STATS-UPS: Stats of the registration dates obtained.");

                // group by year
                groupBy(regs, function(res){ 
                    error = false;
                    data.registrationDate = res;
                    callback(error);
                });
                
            } else {
                console.log("ADMIN-STATS-UPS: Error getting registration dates.");
                
                error = true;
                data.registrationDate = [];
                callback(error);
            }
            
        }
    );
}

function downsStats(data, callback){
    
    var error;
    
    // DOWNS
    regsDownsModel.aggregate([
        {$match:{'regDown':false}},
        {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}}
        ], function(errDown, downs){
            if(!errDown) {
                console.log("ADMIN-STATS-DOWNS: Stats of the registry down dates obtained.");

                // group by year
                groupBy(downs, function(res){
                    error = false;
                    data.downs = res;
                    callback(error);
                });
                
            } else {
                console.log("ADMIN-STATS-DOWNS: Error getting registration downs.");
                
                error = true;
                data.downs = [];
                callback(error);
            } 
        }
    );          
}

function lastAccessStats(data, callback){
    
    var error;
    
    // LAST ACCESSES
    loginStatsModel.aggregate([
        { $group:{'_id':{'year':{ $year: "$date" },'month':{ $month: "$date" }}, count:{ $sum: 1}}},
        { $sort: { _id:-1 }}
        ],  function(errLastAcc, lastAcc) {
            if (!errLastAcc){
                console.log("ADMIN-STATS-LASTACCESS: Stats of the last accesses obtained.");
                  
                // group by year
                groupBy(lastAcc, function(res){
                    error = false;
                    data.lastAccess = res;
                    callback(error);
                });
                
            } else {
                console.log("ADMIN-STATS-LASTACCESS: Error getting last access.");
                
                error = true;
                data.lastAccess = [];
                callback(error);
            }
        }
    );
}

function resourcesStats(data, callback){
    
    var error;
    
    
}


exports.get= function(accountID, callback){
    var error, data;

    // check if the token has access admin permissions
    accVerificator.verifyAdmin(accountID, function(success, reason){

        if(success){
            
            data = { 
                "ups" : {},
                "downs" : {},
                "lastAccess" : {},
                "resources" : {}
            };
            error = false;

            var count = Object.keys(data).length;
            
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
            
            upsStats(data, callbackFunc);
            downsStats(data, callbackFunc);
            lastAccessStats(data, callbackFunc);
            resourcesStats(data, callbackFunc);

        } else {
            error = true;
            data = "FORBIDDEN";

            callback(error, data);
        }
    });
};
