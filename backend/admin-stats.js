var userAccModel = require("./models/user-accounts");
var loginStatsModel = require("./models/login-stats");
var regsDownsModel = require("./models/regs-downs-stats");
var accVerificator = require('./account-verifications.js');

function groupBy(array, callback){

    var result = {};
    
    for(var i = 0; i < array.length; i++){
        var year = array[i]._id.year;
        if(!result[year]){
            result[year] = [];
        }
        result[year].push({ month: array[i]._id.month, data: array[i].count});
    }
    callback(result); 
}

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

////
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

///
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

//

exports.get= function(accountID, callback){
    var error, data;

    // check if the token has access admin permissions
//    accVerificator.verifyAdmin(accountID, function(success, reason){
//
//        if(success){
            data = { 
                "registrationDate" : {},
                "downs" : {},
                "lastAccess" : {},
                "resources" : {}
            };
            error = false;

            // REGISTRATION DATE
            //TODO ultimos 12 meses
            regsDownsModel.aggregate([
                {$match:{'regDown':true}},
                {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}}
                ], function(errReg, regs){
                    if(!errReg) {
                        console.log("ADMIN-STATS-GET: Stats of the registration dates obtained.");

                        // group by year
                        groupBy(regs, function(res){ 
                            error = false;
                            data.registrationDate = res;
                        });

                        // DOWNS
                        regsDownsModel.aggregate([
                            {$match:{'regDown':false}},
                            {$group:{'_id': {'year':{ $year: "$date" },'month':{ $month: "$date" }}, count: {$sum:1}}}
                            ], function(errDown, downs){
                                if(!errDown) {
                                    console.log("ADMIN-STATS-GET: Stats of the registry downs obtained.");

                                    // group by year
                                    groupBy(downs, function(res){
                                        error = false;
                                        data.downs = res;
                                    });

                                    // LAST ACCESS
                                    loginStatsModel.aggregate([
                                        { $group:{'_id':{'year':{ $year: "$date" },'month':{ $month: "$date" }}, count:{ $sum: 1}}},
                                        { $sort: { _id:-1 }}
                                        ],  function(errLastAcc, lastAcc) {
                                            if (!errLastAcc){
                                                console.log("ADMIN-STATS-GET: Stats of the last accesses obtained.");
                                                  
                                                // group by year
                                                groupBy(lastAcc, function(res){
                                                    error = false;
                                                    data.lastAccess = res;
                                                });

                                                callback(error, data);

                                            } else {
                                                console.log("ADMIN-STATS-GET: Error getting last access.");
                                                error = true;
                                                data.lastAccess = [];
                                                callback(error,data);
                                            }
                                    });
                                } else {
                                    console.log("ADMIN-STATS-GET: Error getting registration downs.");
                                    error = true;
                                    data.downs = [];
                                    callback(error, data);
                                } 
                        });                   

                    } else {
                        console.log("ADMIN-STATS-GET: Error getting registration dates.");
                        error = true;
                        data.registrationDate = [];
                        callback(error, data);
                    }  
            });

            // RESOURCES
            // TODO ??

//        } else {
//            error = true;
//            data = "FORBIDDEN";
//
//            callback(error, data);
//        }
//    });
};

