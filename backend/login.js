var userAccModel = require("./models/user-accounts");
var mailCreator = require("./email-creator.js");
var verifyCaptcha = require('./verify-captcha.js');
var adminStats = require("./admin-stats.js");
var crypto = require('crypto');
var request = require('request');
var objectID = require('mongodb').ObjectID;

// accountID = {email, passwd}
exports.localSignin = function (accountID, callback) {
    
    var error, data;
    
    verifyCaptcha.verify(accountID.captchaData.gResponse, accountID.captchaData.rAddress, function(err, data){
        if(!err){

            // get user data
            userAccModel.find({"email": accountID.email, "activated": true, "loginType": "local"},
            
                function(err, dbData){
                    if(!err){
                        
                        var passwd = "";
                        if(accountID.passwd){
                            passwd = crypto.createHash('sha256').update(accountID.passwd).digest('base64');
                        }
                        
                        // validate password & status checks
                        if(dbData.length > 0 && dbData[0].validated && !dbData[0].firstLogin && dbData[0].password === passwd){
                            
                            // get current date
                            var lastDate = new Date();
                            
                            // generate token
                            var token = crypto.randomBytes(25).toString('hex');
                            
                            // set token expiration date (10 mins)
                            var tokenExpire = new Date();
                            tokenExpire.setMinutes(tokenExpire.getMinutes() + 10);
                            
                            // save last access for statistics
                            adminStats.saveLastAccess(lastDate);
                            
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

                        } else if(dbData.length > 0) {
                            
                            if(dbData[0].validated && dbData[0].firstLogin) {
                                // must change the passwd yet
                                error = true;
                                data = "MUST CHANGE PASSWD";
                                callback(error, data);
                                
                            } else if(!dbData[0].validated) {
                                // must validate the account yet
                                error = true;
                                data = "MUST VALIDATE";
                                callback(error, data);
                                
                            } else { //if(dbData[0].password !== passwd)
                                error = true;
                                data = "INCORRECT";
                                callback(error, data);
                            }
                            
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
            
        } else {
            
            console.log("LOGIN-SIGNIN: CAPTCHA FAILURE");
            
            error = true;
            data = "CAPTCHA ERROR";
            callback(error, data);
        }
    });
};

function facebook(accountData, callback) {
    
    var error, data;
    
    var fields = ['id', 'email', 'first_name', 'last_name'];
    var graphApiUrl = 'https://graph.facebook.com/v2.9/me?fields=' + fields.join(',');
    graphApiUrl += '&access_token=' + accountData.code;

    request.get({ url: graphApiUrl, json: true },
        function(err, response, profile) {
        
            if (response.statusCode == 200) {
                error = false;
                data = {"profile": profile};

            } else {
                console.log("LOGIN-FB: Request profile error " + profile.error.message);
                error = true;
                data = "EXTERNAL SERVICE ERROR";
            }
            
            callback(error, data);
        }
    ); 
}

function google(accountData, callback) {
    
    var error, data;
    
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var headers = { Authorization: 'Bearer ' + accountData.code };

    // Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true },
        function(err, response, profile) {
            
            if (!profile.error) {
                error = false;
                data = {"profile": profile};

            } else {
                console.log("LOGIN-GOOGLE: Request profile error " + profile.error.message);
                error = true;
                data = "EXTERNAL SERVICE ERROR";
            }
            
            callback(error, data);
        }
    );
}

function openid(accountData, callback) {
    
    var error, data;
    
    callback(false, null);
}

exports.socialSignin = function(accountData, callback){

    var error, data;

    // define callback function
    var callbackFunc = function(err, resData){
    
        if(!err){
        
            // save last access for statistics
            adminStats.saveLastAccess(new Date());
            
            userAccModel.find({"email": resData.profile.email, "activated": true}, function(err, dbData){
                
                // generate token
                var token = crypto.randomBytes(25).toString('hex');
                
                // set token expiration date (10 mins)
                var tokenExpire = new Date();
                tokenExpire.setMinutes(tokenExpire.getMinutes() + 10);
                
                // search user in DB
                if(!err && dbData.length > 0){
                    
                    // already registered -> update lastDate, token & tokenExpire
                    userAccModel.update({"email": resData.profile.email},
                        {$set : {"lastAccess": new Date(), "token": token, "tokenExpire": tokenExpire}},
                        
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
                    
                } else if(!err) {
                    
                    // not registered
                    var dbUsers = new userAccModel();
                    dbUsers.loginType = resData.loginType;
                    
                    if(resData.loginType === "facebook"){
                        dbUsers.name = resData.profile.first_name;
                        dbUsers.surname = resData.profile.last_name;
                        
                    } else if(resData.loginType === "google") {
                        dbUsers.name = resData.profile.given_name;
                        dbUsers.surname = resData.profile.family_name;
                    }
                    
                    dbUsers.email = resData.profile.email;
                    dbUsers.registrationDate = new Date();
                    dbUsers.lastAccess = new Date();
                    dbUsers.token = token;
                    dbUsers.tokenExpire = tokenExpire;
                    dbUsers.validated = true;
                    dbUsers.firstLogin = false;
                    dbUsers.activated = true;
                    
                    // save registry for statistics
                    adminStats.saveRegistry(dbUsers.registrationDate);
                    
                    // save user
                    dbUsers.save(function(err, dbData){
                        if(!err){
                            // return token and userId
                            error = false;
                            data = {"token": token, "id": dbData._id};
                            
                        } else {
                            error = true;
                            data = "DB ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    error = true;
                    data = "DB ERROR";
                    
                    callback(error, data);
                }
            });
            
        } else {
            error = true;
            data = resData;
            
            callback(error, data);
        }
    };
    
    // call needed function
    if(accountData.loginType === "facebook"){
        facebook(accountData, callbackFunc);
        
    } else if(accountData.loginType === "google"){
        google(accountData, callbackFunc);
        
    } else if(accountData.loginType === "openid"){
        openid(accountData, callbackFunc);
        
    } else {
        error = true;
        data = "INCORRECT LOGINTYPE";
        
        callback(error, data);
    }
};

exports.signup = function (accountData, captchaData, callback) {
    
    var error, data;
    
    verifyCaptcha.verify(captchaData.gResponse, captchaData.rAddress, function(err, data){
        
        if(!err){
            
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
                                
                                // save registry for statistics
                                adminStats.saveRegistry(dbUsers.registrationDate);
                                
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
        } else {
            
            console.log("LOGIN-SIGNUP: CAPTCHA FAILURE");
            
            error = true;
            data = "CAPTCHA ERROR";
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
                                    "type": "first passwd",
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
    
    userAccModel.find({"email": accountID.email, "validated": true, "activated": true, "loginType": "local"},
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

exports.reactivateAccount = function (accountID, callback) {
    
    var error, data;
    
    var callbackFunc = function(err, resData){
        
        if(!err){
            
            userAccModel.find({"email": resData.profile.email, "activated": false}, function(err, dbData){
                
                if(!err){
                    if(dbData.length > 0){
                        
                        userAccModel.update({"_id" : new objectID(dbData[0]._id)},
                            {$set : {"activated": true, "deactivationDate":null}},
                            
                            function(err, res){
                                if(!err){                               
                                    error = false;
                                    data = null;
                                    
                                    // save registry for statistics
                                    adminStats.saveRegistry(new Date());
                                    
                                } else {
                                    console.log("LOGIN-REACT: DB ERROR on update");
                                    
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
                    console.log("LOGIN-REACT: DB ERROR on find");
                    
                    error = true;
                    data = "DB ERROR";
                    callback(error, data);
                }
            });
            
        } else {
            error = true;
            data = resData;
            
            callback(error, data);
        }
    };
    
    // call needed function
    if(accountID.loginType === "local"){
        
        verifyCaptcha.verify(accountID.captchaData.gResponse, accountID.captchaData.rAddress, function(err, data){
            if(!err){
                
                var passwd = crypto.createHash('sha256').update(accountID.passwd).digest('base64');
        
                // validate password and get user data (avoiding retrieval of password)
                userAccModel.find({"email": accountID.email, "password": passwd, "loginType": "local"}, {"password":0},
                
                    function(err, dbData){
                        if(!err && dbData.length > 0){
        
                            error = false;
                            data = {"profile": {"email": accountID.email}};
                            
                            callbackFunc(error, data);
                            
                        } else {
                            error = true;
                            data = "INCORRECT";
                            callback(error, data);
                        }
                    }
                );
            } else {
                console.log("LOGIN-REACT: CAPTCHA FAILURE");
            
                error = true;
                data = "CAPTCHA ERROR";
                callback(error, data);
            }
        });

    } else if(accountID.loginType === "facebook"){
        facebook(accountID, callbackFunc);
        
    } else if(accountID.loginType === "google"){
        google(accountID, callbackFunc);
        
    } else if(accountID.loginType === "openid"){
        openid(accountID, callbackFunc);
        
    } else {
        error = true;
        data = "INCORRECT LOGINTYPE";
        
        callback(error, data);
    }
};
