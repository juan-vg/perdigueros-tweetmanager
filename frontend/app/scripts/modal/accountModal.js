/**
 * Created by sergiopedrerobenedi on 9/8/17.
 */

var app = angular.module('app');

app.controller('accountModalCtrl', function($scope,$uibModalInstance,AlertService,$http,$locale,$route){

    $scope.createAccount = function () {
        var req = {
            method: 'POST',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
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
            AlertService.alert('Enhorabuena', 'La cuenta se ha añadido correctamente', 'Cerrar');
            $route.reload();
        }).catch(function (response) {
            if (response.status == 400) {
                AlertService.alert('Error', 'Error de parametros', 'Cerrar');
            }
            else if (response.status == 403) {
                AlertService.alert('Error', 'El token de usuario no se puede verificar', 'Cerrar');
                localStorage.clear();
                $locale.path('/');
            }
            else if (response.status == 409) {
                AlertService.alert('Error', 'La cuenta ya existe', 'Cerrar');
            }
            else if (response.status == 500) {
                AlertService.alert('Error', 'Error insertando la cuenta de Twitter en la base de datos de PTM', 'Cerrar');
            }
            else if (response.status == 503) {
                AlertService.alert('Error', 'Servicio de Twitter no disponible o datos de autenticación de twitter incorrectos.', 'Cerrar');
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});