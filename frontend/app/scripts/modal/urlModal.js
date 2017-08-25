/**
 * Created by sergiopedrerobenedi on 15/8/17.
 */

var app = angular.module('app');

app.controller('urlModalCtrl', function($scope,$uibModalInstance,AlertService,$http,$locale) {

    $scope.postUrl = function () {
        var req = {
            method: 'POST',
            url: 'http://zaratech-ptm.ddns.net:8888/urls',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                'url': $scope.urlData
            }
        };
        $http(req).then(function (response) {
            $scope.urlResponse = "http://zaratech-ptm.ddns.net:8888/urls/" + response.data.id;
            console.log(response);
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

    $scope.close = function () {
        $uibModalInstance.close();
    };
});
