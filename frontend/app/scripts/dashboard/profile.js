/**
 * Created by sergiopedrerobenedi on 12/7/17.
 */

var app = angular.module('app');
/**
 *
 */

app.controller("profileCtrl", function ($http, $scope, AlertService) {
    var req = {
        method: 'GET',
        url: 'http://zaratech-ptm.ddns.net:8888/users/'
        + localStorage.getItem('userId'),
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    }
    $http(req).then(function (response) {
        $scope.myInfo = response.data;
    });

    /**
     * CHANGES THE CURRENT USER PASSWORD
     */
    $scope.changePassword = function () {
        var req = {
            method: 'PUT',
            url: 'http://zaratech-ptm.ddns.net:8888/users/'
            + localStorage.getItem('userId'),
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            data: {
                'email': $scope.myInfo[0].email,
                'oldPasswd': $scope.oldPasswd,
                'newPasswd': $scope.newPasswd
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Enhorabuena', 'La contraseña se ha cambiado correctamente', 'Cerrar');
        });
    }
});
