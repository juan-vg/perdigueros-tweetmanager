var userAccModel = require("./models/user-accounts");
var mailCreator = require("./email-creator.js");
var crypto = require('crypto');
var objectID = require('mongodb').ObjectID;

// accountID = {email, passwd}
exports.localSignin = function (accountID, callback) {
    
    var error, data;
    
    var passwd = crypto.createHash('sha256').update(accountID.passwd).digest('base64');
    
    // validate password and get user data (avoiding retrieval of password)
    userAccModel.find({"email": accountID.email, "password": passwd, "activated": true, "loginType": "local"}, {"password":0},
    
        function(err, dbData){
            if(!err){
                
                if(dbData.length > 0 && dbData[0].validated && !dbData[0].firstLogin){
                    
                    // get current date
                    var lastDate = new Date();
                    
                    // generate token
                    var token = crypto.randomBytes(25).toString('hex');
                    
                    // set token expiration date (10 mins)
                    var tokenExpire = new Date();
                    tokenExpire.setMinutes(tokenExpire.getMinutes() + 10);
                    
                    
                    // update lastDate, token & tokenExpire
                    userAccModel.update({"_id" : new objectID(dbData[0]._id)},
                        {$set : {"lastAccess": lastDate, "token": token, "tokenExpire": tokenExpire}},
                        
                        function(err, res){
                            if(!err){
                                // return token and userId
                                error = false;
                                data = {"token": token, "id": dbData[0]._id};
                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            callback(error, data);
                        }
                    );

                } else if(dbData.length > 0 && dbData[0].validated) {
                    // must change the passwd yet
                    error = true;
                    data = "MUST CHANGE PASSWD";
                    callback(error, data);
                } else if(dbData.length > 0) {
                    // must validate the account yet
                    error = true;
                    data = "MUST VALIDATE";
                    callback(error, data);
                } else {
                    error = true;
                    data = "INCORRECT";
                    callback(error, data);
                }
                
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
};

exports.signup = function (accountData, callback) {
    
    var error, data;
    
    userAccModel.find({"email": accountData.email}, function(err, dbData){
        if(!err){
            if(dbData.length > 0){
                error = true;
                data = "ALREADY EXISTS";
                callback(error, data);
                
            } else {
                var dbUsers = new userAccModel();
                dbUsers.loginType = "local";
                dbUsers.name = accountData.name;
                dbUsers.surname = accountData.surname;
                dbUsers.email = accountData.email;
                dbUsers.registrationDate = new Date();
                dbUsers.lastAccess = null;
                dbUsers.validated = false;
                dbUsers.validateHash = crypto.randomBytes(20).toString('hex');
                dbUsers.firstLogin = true;
                dbUsers.activated = true;
                
                dbUsers.save(function(err,dbData){
                    if(!err){
                        
                        var emailData = {
                            "type": "validate",
                            "name": dbUsers.name,
                            "code": dbUsers.validateHash,
                            "to": dbUsers.email
                        };
                        
                        // async (not waiting for callback)
                        mailCreator.sendMail(emailData, function(err, mData){
                            if(err){
                                console.log("LOGIN-SIGNUP: ERROR sending email to " + dbUsers.email);
                            }
                        });
                        
                        error = false;
                        data = null;
                        callback(error, data);
                        
                    } else {
                        error = true;
                        data = "DB ERROR";
                        callback(error, data);
                    }
                });
            }
            
        } else {
            error = true;
            data = "DB ERROR";
            callback(error, data);
        }
    });
};

exports.validateUser = function (accountID, callback) {
    
    var error, data;
    
    userAccModel.find({"email": accountID.email, "validateHash": accountID.validationHash, "validated": false, "activated": true},
    
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    var passwd = crypto.randomBytes(15).toString('hex');
                    var passwdHash = crypto.createHash('sha256').update(passwd).digest('base64');
                    
                    userAccModel.update({"_id" : new objectID(dbData[0]._id)},
                        {$set : {"validated": true, "password": passwdHash, "validateHash": null}},
                
                        function(err, res){
                            if(!err){
                                
                                var emailData = {
                                    "type": "passwd",
                                    "name": dbData[0].name,
                                    "passwd": passwd,
                                    "to": dbData[0].email
                                };
                                
                                // async (not waiting for callback)
                                mailCreator.sendMail(emailData, function(err, mData){
                                    if(err){
                                        console.log("LOGIN-SIGNUP: ERROR sending email to " + dbData[0].email);
                                    }
                                });
                                
                                error = false;
                                data = null;
                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            callback(error, data);
                        }
                    );
                } else {
                    error = true;
                    data = "INCORRECT";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
};

exports.resendEmail = function (accountID, callback) {
    
    var error, data;
    
    userAccModel.find({"email": accountID.email, "validated": false, "activated": true},
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    var emailData = {
                        "type": "validate",
                        "name": dbData[0].name,
                        "code": dbData[0].validateHash,
                        "to": dbData[0].email
                    };
                    
                    // async (not waiting for callback)
                    mailCreator.sendMail(emailData, function(err, mData){
                        if(err){
                            console.log("LOGIN-RESEND-EMAIL: ERROR sending email to " + dbData[0].email);
                        }
                    });
                    
                    error = false;
                    data = null;
                    callback(error, data);
                    
                } else {
                    error = true;
                    data = "INCORRECT";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
};

exports.rememberPasswd = function (accountID, callback) {
    
        var error, data;
    
    userAccModel.find({"email": accountID.email, "validated": true, "activated": true},
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    var passwd = crypto.randomBytes(15).toString('hex');
                    var passwdHash = crypto.createHash('sha256').update(passwd).digest('base64');
                    
                    userAccModel.update({"_id" : new objectID(dbData[0]._id)},
                        {$set : {"password": passwdHash}},
                        
                        function(err, res){
                            if(!err){
                                
                                var emailData = {
                                    "type": "passwd",
                                    "name": dbData[0].name,
                                    "passwd": passwd,
                                    "to": dbData[0].email
                                };
                                
                                // async (not waiting for callback)
                                mailCreator.sendMail(emailData, function(err, mData){
                                    if(err){
                                        console.log("LOGIN-REMEMBER-PASSWD: ERROR sending email to " + dbData[0].email);
                                    }
                                });
                                
                                error = false;
                                data = null;
                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            callback(error, data);
                        }
                    );
                    
                } else {
                    error = true;
                    data = "INCORRECT";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
};

exports.firstLogin = function (accountID, callback) {
    
    var error, data;
    
    var oldPasswd = crypto.createHash('sha256').update(accountID.oldPasswd).digest('base64');
    
    userAccModel.find({"email": accountID.email, "password": oldPasswd, "firstLogin": true, "activated": true},
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    var passwdHash = crypto.createHash('sha256').update(accountID.newPasswd).digest('base64');
                    
                    userAccModel.update({"_id" : new objectID(dbData[0]._id)},
                        {$set : {"password": passwdHash, "firstLogin": false}},
                        
                        function(err, res){
                            if(!err){                               
                                error = false;
                                data = null;
                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            callback(error, data);
                        }
                    );
                    
                } else {
                    error = true;
                    data = "INCORRECT";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
};
