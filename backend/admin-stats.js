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


function resourcesByCountry(results, callback){
    
    var error, result = [];
    
    tweetStatsModel.aggregate([
        { $group:{_id:{'country' : "$country"}, count:{ $sum: 1}}}
        ],  function(err, data) {
            if (!err){
                console.log("ADMIN-STATS-ResByCOUNTRY: Stats obtained");
                  
                error = false;
                
                for(var i=0; i<data.length; i++){
                    
                    var entry = {
                        country: data[i]._id.country,
                        count: data[i].count
                    };
                    result.push(entry);
                }
                
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
    
    const dayInMinutes = 24 * 60;
    var error;
    
    var currDate = new Date();
    var pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 15*dayInMinutes);
    
    tweetStatsModel.find({"date": {$lte: currDate, $gte: pastDate}}, function(err, data){
        if(!err){
            console.log("ADMIN-STATS-ResByDAY: Stats obtained");
            
            error = false;
            
            var resources = [], result = [];
            
            //count
            for(var i=0; i<data.length; i++){
                var date = new Date(data[i].date);
                if(resources[date.getMonth()+1] && resources[date.getMonth()+1][date.getDate()]){
                    resources[date.getMonth()+1][date.getDate()]++;
                } else if(resources[date.getMonth()+1]){
                    resources[date.getMonth()+1][date.getDate()] = 1;
                } else {
                    resources[date.getMonth()+1] = [];
                    resources[date.getMonth()+1][date.getDate()] = 1;
                }
            }
            
            //discard null results & parse to {key:value} format
            for(var month=1; month<resources.length; month++){
                if(resources[month]){
                    for(var day=1; day<resources[month].length; day++){
                        if(resources[month][day]){
                            
                            var entry = {
                                month: month,
                                day: day,
                                count: resources[month][day]
                            };
                            result.push(entry);
                        }
                    }
                }
            }

            results.byDay = result;
            callback(error);
            
        } else {
            console.log("ADMIN-STATS-ResByDAY: Error");
                
            error = true;
            results.byDay = [];
            callback(error);
        }
    });
}

function resourcesByUser(results, callback){
    
    var error, result = [];
    
    tweetStatsModel.aggregate([
        { $group:{_id:{'userId' : "$userId"}, count:{ $sum: 1}}},
        {$sort:{count:-1}},
        {$limit: 10}
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
        
        if(count == 0){
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

