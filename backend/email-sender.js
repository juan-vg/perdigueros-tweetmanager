'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'zaratech.ptm@gmail.com',
        pass: 'zaratech.ptm-zaratech.ptm'
    }
});

module.exports = function(params) {
    this.from = 'zaratech.ptm@gmail.com';

    this.send = function(){
        var options = {
            from : this.from,
            to : params.to,
            subject : params.subject,
            text : params.message
        };

        transporter.sendMail(options, function(err, suc){
            err ? params.errorCallback(err) : params.successCallback(suc);
        });
    }
}
/*
// setup email data with unicode symbols
let mailOptions = {
    from: '"PTM - Perdigueros Tweet Manager" <zaratech.ptm@gmail.com>', // sender address
    to: 'make_the_king@hotmail.com, maketheking@gmail.com', // list of receivers
    subject: 'PTM TEST', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
*/
