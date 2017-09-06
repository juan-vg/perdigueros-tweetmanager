var Mail = require('./email-sender.js');
var config = require('./config');

exports.sendMail = function(emailData, callback){
    
    var error, data;
    
    // header
    var message = 'Hello '+ emailData.name +',\n\n';
    
    // body
    if(emailData.type === "validate") {
        message += 'We are pleased to inform you that your new PTM account has been created.\n';
        message += 'Please, use the following code in order to validate your email.\n\nCode: ' + emailData.code;
        message += '\n\nYou can validate your account at ' + config.apiUrl + "/validate"
            
    } else if(emailData.type === "first passwd") {
        message += 'We have created a new password for you.\n';
        message += '\n\nPassword: ' + emailData.passwd;
        message += '\n\nYou must change it at ' + config.apiUrl + "/first-login"
        
    } else { //if(emailData.type === "passwd")
        message += 'We have created a new password for you.\n';
        message += '\n\nPassword: ' + emailData.passwd;
    }
    
    // footer
    message += '\n\n\nBest regards,\nThe PTM team.\nA Zaratech Dynamics product.\nAll rights registered 2017.';
    

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
