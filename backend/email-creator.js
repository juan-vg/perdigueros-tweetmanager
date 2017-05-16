var Mail = require('./email-sender.js');

exports.sendMail = function(emailData, callback){
	
	var error, data;
	
	var message;
	
	if(emailData.type == "validate"){
		message = 'Hello '+ emailData.name +',\n\nWe are glad to inform you that your new account'
		    +' has been created.\nPlease, use the following code in order to validate your email.\n\nCode: ' + emailData.code
		    + '\n\n\nBest regards,\nThe PTM team';
	} else {
		//TODO
		message = 'Hello '+ emailData.name +', we are glad to inform you that your new account '+ emailData.account 
		    +' has been created. Please, use the following code in order to validate your email. Code: ' + emailData.code;
	}

	var mail = new Mail({
		to: emailData.to,
		subject: 'PTM - Perdigueros Tweet Manager',
		message: message,
		successCallback: function(suc) {
			error = false;
			data = null;
			callback(error, data);
		},
		errorCallback: function(err) {
			error = true;
			data = err;
			callback(error, data);
		}
	});

	mail.send();
};
