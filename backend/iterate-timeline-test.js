const BigInteger = require('./utilities/biginteger').BigInteger;
var TwitterPackage = require('twitter');

//console.log(a.subtract(1).toString());


// create auth set
const secret = {
    consumer_key: 'c9Vcr7MDMDcj3Ad1bGtNqymRm',
    consumer_secret: '5itqLbT60JR6y6QlXm3VLLOQynBTYX1jQwX1yzE1EIrS1AmFJW',
    access_token_key: '808011183794126848-5AmYN2pzIzNxtRTxWhwA2VWFikME7bj',
    access_token_secret: '3jLmIWe1bFowEPb87xX9AvcUVCJSz9Nh5WcYbPJuIC89j'
};
var Twitter = new TwitterPackage(secret);

var count, id=-1;
const COUNT = 10;

function iter(){
    console.log();
    console.log('--------------------- API CALL ---------------------');


    var query;

    if(id < 0){
        query = {'count': COUNT};
    } else {
        var max_id = BigInteger(id);
        max_id = max_id.subtract(1);
        query = {'count': COUNT, 'max_id': max_id.toString()};
    }

    console.log(query);
    console.log('----------------------------------------------------');


    Twitter.get('statuses/home_timeline', query, function(err, body){
        
        if(!err){

            count = body.length;
            
            for(var i=0; i<body.length; i++){
                
                var tweet = body[i].text;
                id = body[i].id;
                
                console.log((i+1)+" --> Tweet ID='"+id+"': '"+tweet+"'")
            }
            
            callbackFunc()
            
        } else {
            console.log("TWEETS-HOME-TIMELINE: Twitter error ("+JSON.stringify(err)+")");
        }
    });
}

function callbackFunc(){
    if (count == COUNT){
        setTimeout(iter, 3000);
    }
}

iter();
