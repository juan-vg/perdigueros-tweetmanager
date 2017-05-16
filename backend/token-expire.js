var usersModel = require("./models/user-accounts");

exports.update = function(token, callback){
	
	verifyToken(token, function(err, verifData){
		
		if(!err){
			
			var tokenExpire = new Date();
            tokenExpire.setMinutes(tokenExpire.getMinutes() + 10);
			
			userAccModel.update({"token" : token,
				{$set : {"tokenExpire": tokenExpire}},
				
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
			data = verifData;
			callback(error, data);
		}
	});
};

function verifyToken(token, callback){
	
	var error, data;
	
	usersModel.find({"token": token}, function(err, dbData){
		
		if(!err && dbData.length > 0){
			
			var currDate = new Date();
			var expireDate = new Date(dbData[0].tokenExpire);
			var dif = parseInt((date-date2)/1000)/60;
			
			// check if token has expired (10 mins)
			if(dif <= 10){
				error = false;
                data = null;				
			} else {
				error = true;
                data = "EXPIRED";
			}
			
		} else if(!err){
			error = true;
			data = "NOT FOUND";
		} else {
			error = true;
			data = "DB ERROR";
		}
		
		callback(error, data);
	});
};
module.exports.verifyToken = verifyToken;
