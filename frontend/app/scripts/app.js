/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */

/**
 * Instance the angular module 'app' and all the extern modules that it uses.
 */
angular.module('app', ['ngRoute', 'vcRecaptcha', 'satellizer','LocalStorageModule','chart.js']);

//variable for manage the main module
var app = angular.module("app");

// configure our application
app.config(function ($routeProvider, $locationProvider, $authProvider) {

    //configure our routes
    $routeProvider

    // route for the home page
        .when('/',{
            templateUrl : 'partials/login/signin.html',
            controller : 'signinCtrl'
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
        //route for dashboard page, token required
        .when('/dashboard', {
            templateUrl: 'partials/dashboard/dashboard.html',
            controller : 'dashboardCtrl'
        })
        //route for dashboard page, token required
        .when('/auth/callback', {
            templateUrl: 'partials/dashboard/dashboard.htmll',
            controller : 'dashboardCtrl'
        })

        //route for forgot password
        .when('/forgot-password', {
            templateUrl: 'partials/login/forgot.html',
            controller: 'forgotPasswdCtrl'
        })
        .when('/logout', {
            templateUrl: 'partials/login/signin.html',
            controller: 'LogoutController'
        })
		//route for signin admin
        .when('/admin',{
            templateUrl : 'partials/admin/admin-login-panel.html',
			controller: 'PasswordController'
        })
		//route for main admin
        .when('/admin-main-panel',{
            templateUrl : 'partials/admin/admin-main-panel.html',
			controller: 'UserController'
        })
		//route for list accounts admin
        .when('/admin-accounts-panel',{
            templateUrl : 'partials/admin/admin-accounts-panel.html',
			controller: 'AccountController'
        })
		//route for door stats admin
        .when('/admin-door-panel',{
            templateUrl : 'partials/admin/admin-door-panel.html',
			controller: 'UserDoorController'
        })
		//route for last stats admin
        .when('/admin-last-panel',{
            templateUrl : 'partials/admin/admin-last-panel.html',
			controller: 'AccessDataController'
        })
		//route for activity stats admin
        .when('/admin-activity-panel',{
            templateUrl : 'partials/admin/admin-activity-panel.html',
			controller: 'StadisticsController'
        })
    /* */
    ;
    $locationProvider.html5Mode(true);

    //configure auth providers
    $authProvider.loginUrl = 'http://zaratech-ptm.ddns.net:8888/login/signin';
    $authProvider.signupUrl = 'http://zaratech-ptm.ddns.net:8888/login/signup';

    //facebook auth provider config
    $authProvider.facebook({
        clientId : '212919395883976',
        responseType: 'token',
        name: 'facebook',
        url: 'http://zaratech-ptm.ddns.net:8888/auth/facebook',
        redirectUri : window.location.origin + '/auth/callback'
    });

    //google auth provider config
    $authProvider.google({
        clientId: '60622240890-eg0kb7s2v246edt7nbpqqjst6rk8uj75.apps.googleusercontent.com',
        responseType:'token',
        name: 'google',
        url: 'http://zaratech-ptm.ddns.net:8888/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri : window.location.origin + '/auth/callback'
    });

    //OpenID auth provider config
    $authProvider.oauth2({
        name: 'openidconnect',
        redirectUri: window.location.origin + '/auth/callback',
        clientId: 'ID',
        responseType :'id_token token',
        requiredUrlParams: ['scope'],
        scope: ['openid','profile','email'],
        scopeDelimiter: '+',
        authorizationEndpoint: 'http://zaratech-ptm.ddns.net:8888/auth/openid',
    });

});
