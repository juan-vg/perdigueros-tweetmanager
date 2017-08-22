var userAccModel = require("./models/user-accounts");
var loginStatsModel = require("./models/login-stats");
var regsDownsModel = require("./models/regs-downs-stats");
var tweetStatsModel = require("./models/tweet-stats");
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

function groupByYear(array, callback){

    var result = {};
    
    // group by year
    for(var i = 0; i < array.length; i++){
        var year = array[i]._id.year;
        if(!result[year]){
            result[year] = [];
        }
        result[year].push({ month: array[i]._id.month, data: array[i].count});
    }
    callback(result); 
}

function upsStats(data, callback){
    
    var error;
    
    var minDate = new Date();
    minDate.setMonth(minDate.getMonth()-12);
    
    // REGISTRATION DATES
    regsDownsModel.aggregate([
        {$match:{'regDown':true, 'date': {$gte: minDate}}},
        {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}},
        {$sort: {_id: 1}}
        ], function(errReg, regs){
            if(!errReg) {

                // group by year
                groupByYear(regs, function(res){
                    console.log("ADMIN-STATS-UPS: Stats of the registration dates obtained.");
                    error = false;
                    data.ups = res;
                    callback(error);
                });
                
            } else {
                console.log("ADMIN-STATS-UPS: Error getting registration dates.");
                
                error = true;
                data.ups = [];
                callback(error);
            }
            
        }
    );
}

function downsStats(data, callback){
    
    var error;
    
    var minDate = new Date();
    minDate.setMonth(minDate.getMonth()-12);
    
    // DOWNS
    regsDownsModel.aggregate([
        {$match:{'regDown':false, 'date': {$gte: minDate}}},
        {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}},
        {$sort: {_id: 1}}
        ], function(errDown, downs){
            if(!errDown) {
                
                // group by year
                groupByYear(downs, function(res){
                    console.log("ADMIN-STATS-DOWNS: Stats of the registry down dates obtained.");
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
    
    var minDate = new Date();
    minDate.setMonth(minDate.getMonth()-12);
    
    // LAST ACCESSES
    loginStatsModel.aggregate([
        {$match:{'date': {$gte: minDate}}},
        { $group:{'_id':{'year':{ $year: "$date" },'month':{ $month: "$date" }}, count:{ $sum: 1}}},
        { $sort: { _id: 1 }}
        ],  function(errLastAcc, lastAcc) {
            if (!errLastAcc){
                  
                // group by year
                groupByYear(lastAcc, function(res){
                    console.log("ADMIN-STATS-LASTACCESS: Stats of the last accesses obtained.");
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


function resourcesByCountry(results, callback){
    
    var error, result = [];
    
    tweetStatsModel.aggregate([
        { $group:{_id:{'country' : "$country"}, count:{ $sum: 1}}}
        ],  function(err, data) {
            if (!err){
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        country: data[i]._id.country,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
                console.log("ADMIN-STATS-ResByCOUNTRY: Stats obtained");
                error = false;
                results.byCountry = result;
                callback(error);
                
            } else {
                console.log("ADMIN-STATS-ResByCOUNTRY: Error");
                
                error = true;
                results.byCountry = [];
                callback(error);
            }
        }
    );
}

function resourcesByDay(results, callback){
    
    var error, result = [];
    
    // get the first day and the first hour and minute from the current month
    var pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth()-1);
    
    tweetStatsModel.aggregate([
        {$match: {"date": {$gte: pastDate}}},
        {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }, 'day':{ $dayOfMonth: "$date"}}, count: {$sum:1}}},
        {$sort:{_id: 1}}
        ],  function(err, data) {
            
                if(!err){
                    
                    for(var i=0; i<data.length; i++){
                        
                        var entry = {
                            month: data[i]._id.month,
                            day: data[i]._id.day,
                            count: data[i].count
                        };
                        result.push(entry);
                    }
                    
                    console.log("ADMIN-STATS-ResByDAY: Stats obtained");
                    error = false;
                    results.byDay = result;
                    callback(error);
                    
                } else {
                    console.log("ADMIN-STATS-ResByDAY: Error");
                        
                    error = true;
                    results.byDay = [];
                    callback(error);
                }
        }
    );
}

function resourcesByUser(results, callback){
    
    var error, result = [];
    
    tweetStatsModel.aggregate([
        {$group:{_id:{'userId' : "$userId"}, count:{ $sum: 1}}},
        {$sort:{count:-1}},
        {$limit: 10}
        ],  function(err, data) {
            
            if(!err){
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        userId: data[i]._id.userId,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
                console.log("ADMIN-STATS-ResByUSER: Stats obtained");
                error = false;
                results.byUser = result;
                callback(error);
                
            } else {
                console.log("ADMIN-STATS-ResByUSER: Error");
                    
                error = true;
                results.byUser = [];
                callback(error);
            }
    });
    
}

function resourcesStats(data, callback){
    
    var error;
    
    var results = {
        byCountry: {},
        byDay: {},
        byUser: {}
    };
    
    var count = Object.keys(results).length-1;
            
    var callbackFunc = function(err){
        
        if(err){
            error = true;
        }
        
        if(count === 0){
            data.resources = results;
            callback(error);
        } else {
            count--;
        }
    };
    
    resourcesByCountry(results, callbackFunc);
    resourcesByDay(results, callbackFunc);
    resourcesByUser(results, callbackFunc);
}


exports.get = function(accountID, callback){
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

            var count = Object.keys(data).length-1;
            
            var callbackFunc = function(err){
                
                if(err){
                    error = true;
                }
                
                if(count === 0){
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

