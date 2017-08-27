/**
 * Instance the angular module 'app_admin' and all the extern modules that it uses.
 */
angular.module('app_admin', ['ngRoute', 'vcRecaptcha', 'satellizer','LocalStorageModule','chart.js']);

//variable for manage the main module
var app_admin = angular.module("app_admin");

// configure our application
app_admin.config(function ($routeProvider, $locationProvider) {

    //configure our routes
    $routeProvider

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
            controller: 'StatisticsController'
        })

    /* */
    ;

    $locationProvider.html5Mode(true);
});