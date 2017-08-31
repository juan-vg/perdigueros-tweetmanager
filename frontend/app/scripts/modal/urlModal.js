/**
 * Created by sergiopedrerobenedi on 15/8/17.
 */

var app = angular.module('app');

app.controller('urlModalCtrl', function($scope,$uibModalInstance,AlertService,$http,$locale) {

    $scope.postUrl = function () {
        var req = {
            method: 'POST',
            url: localStorage.getItem('api')+'/urls',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                'url': $scope.urlData
            }
        };
        $http(req).then(function (response) {
            $scope.urlResponse = localStorage.getItem('api')+"/urls/" + response.data.id;
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
                AlertService.alert('Error', 'Error inserting the url into the PTM database', 'Close');
            }
            else if (response.status == 503) {
                AlertService.alert('Error','Twitter Internal Service error or incorrect twitter authentication data.','Close');
            }
        });
    }

    $scope.close = function () {
        $uibModalInstance.close();
    };
});
