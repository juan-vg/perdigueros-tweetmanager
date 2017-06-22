/**
 * Created by sergiopedrerobenedi on 22/6/17.
 */

var app = angular.module('app');

app.controller('accountTableCtrl', function ($rootScope,$location,$scope, $http) {
    $scope.createAccount= function () {
        var data = {
            'information' : {
                'consumerKey': 'KLkZV8ra4JA2udlb2gsHUCT6Q',
                'consumerSecret' : '	qgXDjk9hfzhOyYVZbZKTcZVgNVhumMfTcwhkXKCeYiOmbt2kNg',
                'accessToken' : $scope.accessToken,
                'accessTokenSecret' : $scope.accessTokenSecret

            },
            'description' : $scope.description
        };
        var req = {
            method: 'POST',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
            headers: {
                'Content-Type':'application/json',
                'token' : localStorage.getItem('token')
            },
            data : data
        };
        $http(req).then(function(response){
            var name   = response.data[0].email.substring(0, response.data[0].email.lastIndexOf("@"));
            console.log(name);
            $rootScope.currentUser = name;
        });
    };
});