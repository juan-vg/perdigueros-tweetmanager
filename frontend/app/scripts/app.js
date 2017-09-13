/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */

/**
 * Instance the angular module 'app' and all the extern modules that it uses.
 */
angular.module('app', ['ngRoute','app_admin','vcRecaptcha', 'satellizer','LocalStorageModule','chart.js','ngtweet',
    'ui.bootstrap','ngclipboard','ngWebSocket','ae-datetimepicker','ngLoader','alexjoffroy.angular-loaders']);

//variable for manage the main module
var app = angular.module("app");

// configure our application
app.config(function ($routeProvider, $locationProvider, $authProvider) {

    //configure our routes
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl: 'partials/login/signin.html',
            controller: 'signinCtrl as login',
            private : true
        })
        // route for the signup page
        .when('/signup', {
            templateUrl: 'partials/login/signup.html',
            controller: 'signupCtrl'
        })
  
        //route for the validate page
        .when('/validate', {
            templateUrl: 'partials/login/validate.html',
            controller: 'validateCtrl'
        })
  
        //route for the remember page
        .when('/remember', {
            templateUrl: 'partials/login/validate.html',
            controller: 'validateCtrl'
        })

        //route for first-login page
        .when('/first-login', {
            templateUrl: 'partials/login/first-login.html',
            controller: 'firstLoginCtrl'
        })
        .when('/reactivate',{
            templateUrl : 'partials/login/reactivate.html',
            controller : 'reactivateCtrl as reactivate'
        })
  
        //route for dashboard page, token required
        .when('/dashboard', {
            templateUrl: 'partials/dashboard/dashboard.html',
            controller : 'dashboardCtrl',
            private : true
        })
  
        //route for dashboard page, token required
        .when('/auth/callback', {
            templateUrl: 'partials/login/callback.html',
            controller : 'dashboardCtrl'
        })

        //route for forgot password
        .when('/forgot-password', {
            templateUrl: 'partials/login/forgot.html',
            controller: 'forgotPasswdCtrl'
        })
        .when('/statistics',{
            templateUrl: 'partials/statistics/stats.html',
            controller:'statisticsController'
        })

        .when('/dashboard/profile',{
            templateUrl : 'partials/dashboard/profile.html',
            controller: 'profileCtrl'
        })
        .when('/404',{
            templateUrl : 'partials/404.html',
            controller : '404Ctrl'
        })
        .otherwise({redirectTo:'/404'});
  
    /* */
    ;
    $locationProvider.html5Mode(true);

    //configure auth providers
    $authProvider.loginUrl = localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/signin';
    $authProvider.signupUrl = localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/signup';

    //facebook auth provider config
    $authProvider.facebook({
        clientId : '212919395883976',
        responseType: 'token',
        name: 'facebook',
        url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/auth/facebook',
        redirectUri : window.location.origin + '/auth/callback'
    });

    //google auth provider config
    $authProvider.google({
        clientId: '60622240890-eg0kb7s2v246edt7nbpqqjst6rk8uj75.apps.googleusercontent.com',
        responseType:'token',
        name: 'google',
        url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri : window.location.origin + '/auth/callback'
    });

    //OpenID auth provider config
    $authProvider.oauth2({
        name: 'openid',
        redirectUri: window.location.origin + '/auth/callback',
        clientId: 'ID',
        responseType :'id_token token',
        requiredUrlParams: ['scope'],
        scope: ['openid','profile','email'],
        scopeDelimiter: '+',
        authorizationEndpoint: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/auth/openid',
    });

});

app.run(function($http){
    $http.get('config.json').
    then(function onSuccess(response) {
        localStorage.setItem('api', response.data.api);
        localStorage.setItem('port', response.data.apiPort);
        localStorage.setItem('rtport', response.data.rtPort);
        localStorage.setItem('wsApi',response.data.wsApi);
    }).
    catch(function onError(response) {
        console.log("Error obteniendo API");
    });
});

app.factory('hashtagSocket',function($websocket,AlertService){
    var hashtagSocket;

    var tweetCollection = [];
    var lastId = 0;
    var workingSocket = false;

    var start = function(callback){
        hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
        localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        tweetCollection = [];
        workingSocket = false;
        callback(tweetCollection,workingSocket);
        hashtagSocket.onMessage(function (response) {
            workingSocket = true;
            //console.log(tweetCollection.length);
            if (response.data == "TWITTER ERROR") {
                hashtagSocket.close();
                start();
            }
            else if(response.data =='EMPTY LIST ERROR'){
                workingSocket = false;
                callback(tweetCollection,workingSocket);
                AlertService.alert('Atention','There are not hashtags to follow in this account','Close');
            }
            else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                workingSocket = false;
                callback(tweetCollection,workingSocket);
                AlertService.alert('Error','Socket validation error: account not found','Close');
            }
            else {
                var res;
                try {
                    res = JSON.parse(response.data);
                }
                catch (e) {
                    res = {'id_str': response.data};
                }
                // LIMIT LENGTH OF TWEET ARRAY TO 20
                if (tweetCollection.length == 20) {
                    tweetCollection.splice(1, 1);
                }
                // if last id inserted is not equal that the next id will be inserted
                if(lastId!=res.id_str){
                    tweetCollection.push({
                        'id_str': res.id_str
                    });
                    callback(tweetCollection,workingSocket);
                }
                lastId = res.id_str;
            }

        });
        hashtagSocket.onClose(function(){
            hashtagSocket.hashtagTweet = null;
        });

        hashtagSocket.send('token:' + localStorage.getItem('token'));
    }

    var methods = {
        tweetCollection : tweetCollection,
        workingSocket : workingSocket,
        start : start,
        close : function(){
            if(hashtagSocket){
                hashtagSocket.close();
            }
        }
    };

    return methods;
});

app.factory('followedSocket',function($websocket,AlertService){
    var followedSocket;
    var tweetCollection = [];
    var lastId = 0;
    var workingSocket = false;

    var start = function(callback){
        followedSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
        localStorage.getItem('selectedAccount') + '/tweets/followed');

        tweetCollection = [];
        workingSocket = false;
        followedSocket.onMessage(function (response) {
            workingSocket = true;
            //console.log(tweetCollection.length);
            if (response.data == "TWITTER ERROR") {
                followedSocket.close();
                start();
            }
            else if(response.data =='EMPTY LIST ERROR'){
                workingSocket = false;
                callback(tweetCollection, workingSocket);
                AlertService.alert('Atention','There are not users to follow in this account','Close');
            }
            else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                workingSocket = false;
                callback(tweetCollection, workingSocket);
                AlertService.alert('Error','Socket validation error: account not found','Close');
            }
            else {
                var res;
                try {
                    res = JSON.parse(response.data);
                }
                catch (e) {
                    res = {'id_str': response.data};
                }
                // LIMIT LENGTH OF TWEET ARRAY TO 20
                if (tweetCollection.length == 20) {
                    tweetCollection.splice(1, 1);
                }
                // if last id inserted is not equal that the next id will be inserted
                if(lastId!=res.id_str ){
                    tweetCollection.push({
                        'id_str': res.id_str
                    });
                    callback(tweetCollection,workingSocket);
                }
                lastId = res.id_str;
            }
        });

        followedSocket.onClose(function(){
            followedSocket.followedTweet = null;
        });

        followedSocket.send('token:' + localStorage.getItem('token'));
    }

    var methods = {
        tweetCollection : tweetCollection,
        workingSocket : workingSocket,
        start : start,
        close : function(){
            if(followedSocket){
                followedSocket.close();
            }
        }
    };

    return methods;
});


