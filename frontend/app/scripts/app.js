/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */

/**
 * Instance the angular module 'app' and all the extern modules that it uses.
 */
angular.module('app', ['ngRoute','app_admin','vcRecaptcha', 'satellizer','LocalStorageModule','chart.js','ngtweet',
    'ui.bootstrap','ngclipboard','ngWebSocket','ae-datetimepicker','ngLoader']);

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

app.factory('hashtagSocket',function($websocket){

    var hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
        localStorage.getItem('selectedAccount') + '/tweets/hashtags');

    var tweetCollection = [];
    var noTw = "";

    hashtagSocket.onError(function(response){
        if (response.data == "TWITTER ERROR") {
            hashtagSocket.close();
            hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        }
        else if(response.data =='EMPTY LIST ERROR'){
            noTw = "No tweets yet";
            hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        }
        else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
            console.log(response.data);
        }
    });
    hashtagSocket.onMessage(function (response) {
        console.log(tweetCollection.length);
        if (response.data == "TWITTER ERROR") {
            hashtagSocket.close();
            hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        }
        else if(response.data =='EMPTY LIST ERROR'){
            noTw = "No tweets yet";
            hashtagSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        }
        else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
            console.log(response.data);
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
            tweetCollection.push({
                'id_str': res.id_str
            });
        }
    });

    hashtagSocket.onClose(function(response){
        hashtagSocket.tweetCollection = null;
        hashtagSocket = hashtagSocket;
    });

    var methods = {
        tweetCollection : tweetCollection,
        noTw : noTw,
        get: function() {
            hashtagSocket.send('token:' + localStorage.getItem('token'));
        },
        close : function(){
            hashtagSocket.close();
        }
    };

    return methods;
});

app.factory('followedSocket',function($websocket,$rootScope){
    var followedSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
        localStorage.getItem('selectedAccount') + '/tweets/followed');

    var tweetCollection = [];
    var noTw = "";



    followedSocket.onMessage(function (response) {
        console.log(tweetCollection.length);
        if (response.data == "TWITTER ERROR") {
            console.log(response.data);
            followedSocket.close();
            followedSocket = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/followed');
        }
        else if(response.data =='EMPTY LIST ERROR'){
            noTw = "No tweets yet";
        }
        else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
            console.log(response.data);
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
            tweetCollection.push({
                'id_str': res.id_str
            });
        }
    });

    var methods = {
        tweetCollection : tweetCollection,
        noTw : noTw,
        get: function() {
            followedSocket.send('token:' + localStorage.getItem('token'));
        },
        close : function(){
            followedSocket.close();
        }
    };

    return methods;
});


