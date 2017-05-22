/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */

angular.module('app', ['ngRoute','vcRecaptcha','satellizer',
    'ngStorage']);

var app = angular.module("app");


// configure our routes
app.config(function($routeProvider,$locationProvider,$authProvider) {

    $routeProvider

    // route for the home page
        .when('/' ,{
            templateUrl : 'partials/login/signin.html',
            controller  : 'signinCtrl',
            resolve: function($localStorage, $location) {
                if ($localStorage.token) {
                    $location.url('/dashboard');
                }
            }
        })
        // route for the signup page
        .when('/signup', {
            templateUrl : 'partials/login/signup.html',
            controller  : 'signupCtrl',
        })
        //route for the validate page
        .when('/validate',{
            templateUrl : 'partials/login/validate.html',
            controller : 'validateCtrl'
        })
        //route for the validate page
        .when('/remember',{
            templateUrl : 'partials/login/validate.html',
            controller : 'validateCtrl'
        })

        //route for first-login page
        .when('/first-login',{
            templateUrl : 'partials/login/first-login.html',
            controller : 'firstLoginCtrl'
        })
        //route for dashboard page
        .when('/dashboard',{
            templateUrl : 'partials/dashboard/dashboard.html',
            controller : 'mainPanelCtrl',
        })

        //route for forgot password
        .when('/forgot-password',{
            templateUrl : 'partials/login/forgot.html',
            controller : 'forgotPasswdCtrl'
        })
    $locationProvider.html5Mode(true);

    /**
     *  Satellizer config
     */
    $authProvider.tokenName = "token";
    $authProvider.tokenPrefix = "ptm";
    $authProvider.loginUrl = "http://zaratech-ptm.ddns.net:8888/login/signin";
    $authProvider.facebook({
        clientId: '212919395883976',
        url: 'http://zaratech-ptm.ddns.net:8888/auth/facebook',
        authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
        redirectUri: (window.location.origin || window.location.protocol + '//' + window.location.host) + '/'
    });

    $authProvider.google({
        clientId: '60622240890',
        url: 'http://zaratech-ptm.ddns.net:8888/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri : window.location.origin || window.location.protocol + '//' + window.location.host
    });


});



