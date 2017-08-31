/**
 * Created by sergiopedrerobenedi on 9/8/17.
 */

var app = angular.module('app');

app.controller('accountModalCtrl', function($scope,$uibModalInstance,AlertService,$http,$locale,$route){

    $scope.createAccount = function () {
        var req = {
            method: 'POST',
            url: localStorage.getItem('api')+'/twitter-accounts',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            data: {
                'information': {
                    'consumerKey': $scope.consumerKey,
                    'consumerSecret': $scope.consumerSecret,
                    'accessToken': $scope.accessToken,
                    'accessTokenSecret': $scope.accessTokenSecret
                },
                'description': $scope.description
            }
        };
        $http(req).then(function (response) {
            $uibModalInstance.close();
            AlertService.alert('Congratulations', 'Account has beend added successfully.', 'Close');
            $route.reload();
        }).catch(function (response) {
            if (response.status == 400) {
                AlertService.alert('Error', 'Params error', 'Close');
            }
            else if (response.status == 403) {
                localStorage.clear();
                AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                $location.url('/');
            }
            else if (response.status == 409) {
                AlertService.alert('Error', 'Account exists into the database', 'Close');
            }
            else if (response.status == 500) {
                AlertService.alert('Error', 'Error inserting the twitter account into the PTM database', 'Close');
            }
            else if (response.status == 503) {
                AlertService.alert('Error','Twitter Internal Service error or incorrect twitter authentication data.','Close');
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});