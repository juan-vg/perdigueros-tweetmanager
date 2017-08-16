/**
 * Created by sergiopedrerobenedi on 12/7/17.
 */

var app = angular.module('app');
/**
 *
 */

app.controller("profileCtrl", function ($http, $scope, AlertService, $location) {
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

    $scope.removeAccount = function () {
        var req = {
            method: 'DELETE',
            url: 'http://zaratech-ptm.ddns.net:8888/users/' + localStorage.getItem('userId'),
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
        };
        $http(req).then(function (response) {
            AlertService.alert('Cuenta borrada correctamente', "La Ley Orgánica de " +
                "Protección de Datos nos obliga a mantener tu cuenta en nuestros servidores durante el plazo de seis meses." +
                " Nada nos gustaría más que poder seguir tus indicaciones de borrar la cuenta, pero como no es posible a cambio " +
                "te ofrecemos la posibilidad de recuperarla siempre que lo solicites dentro de este plazo. Atentamente, el " +
                "equipo de Zaratech PTM", 'Cerrar');
            localStorage.clear();
            $location.url('/');
        });

    }
    $scope.showDeleteModal = function () {
        AlertService.alert('Eliminar cuenta ', '¿Está seguro de que desea eliminar esta cuenta?', 'Si', $scope.removeAccount, 'Cancelar');
    }
});
