/**
 * Created by sergiopedrerobenedi on 22/6/17.
 */

var app = angular.module('app');

/**
 *  Controller for handle account table information.
 */
app.controller('accountTableCtrl', function ($http, $rootScope, $uibModal, $route, AlertService) {
    var accountCtrl = this;
    accountCtrl.active = false;
    $rootScope.activeAccount = accountCtrl.active;

    /**
     * GET TWITTER ACCOUNTS
     * @type {{method: string, url: string, headers: {Content-Type: string, token}}}
     */
    var req = {
        method: 'GET',
        url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    };
    $http(req).then(function (response) {
        accountCtrl.accountList = response.data;
    })
        .catch(function (response) {
            if (response.status == 403) {
                AlertService.alert('Error', 'El usuario no tiene permiso para listar cuentas de Twitter.', 'Cerrar');
            }
            else if (response.status == 500) {
                AlertService.alert('Error', 'Error obteniendo las cuentas de Twitter de la base de datos.', 'Cerrar');
            }
        });

    /**
     * SELECTS AN ACCOUNT FROM LIST
     * @param account
     */
    accountCtrl.selectAccount = function (account) {
        accountCtrl.active = !accountCtrl.active;
        $rootScope.activeAccount = accountCtrl.active;
        localStorage.setItem('selectedAccount', account._id);
    };

    accountCtrl.createAccountModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'partials/modal/addAccount.html',
            controller: 'accountModalCtrl',
        });
    }

    /**
     * SHOWS DELETE MODAL
     */
    accountCtrl.showDeleteModal = function () {
        AlertService.alert('Eliminar cuenta ', '¿Está seguro de que desea eliminar esta cuenta?', 'Si', accountCtrl.deleteAccount, 'Cancelar');

    };
    /**
     * DELETE AN ACCOUNT SELECTED FROM LIST
     */
    accountCtrl.deleteAccount = function () {
        var req = {
            method: 'DELETE',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount'),
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Cuenta borrada correctamente', "La Ley Orgánica de " +
                "Protección de Datos nos obliga a mantener tu cuenta en nuestros servidores durante el plazo de seis meses." +
                " Nada nos gustaría más que poder seguir tus indicaciones de borrar la cuenta, pero como no es posible a cambio " +
                "te ofrecemos la posibilidad de recuperarla siempre que lo solicites dentro de este plazo. Atentamente, el " +
                "equipo de Zaratech PTM", 'Cerrar');
            $route.reload();
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'La cuenta seleccionada no es valida para realizar su eliminación.', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'No es propietario de esta cuenta de Twitter', 'Cerrar');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'No se encuentra el id de la cuenta a borrar.', 'Cerrar');
                }
                else if(response.status == 500){
                    AlertService.alert('Error','Error borrando la cuenta de Twitter de la base de datos.','Cerrar');
                }
            });
    }
    /**
     * SHOW ADD TWITTER ACCOUNT MODAL
     */
    accountCtrl.showModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'partials/modal/addTwitterAccount.html',
            controller: 'accountModalCtrl'
        });
    }
    /**
     * REACTIVATES AN ACCOUNT DELETED PREVIOUSLY
     */
    accountCtrl.reactivate = function () {
        var req = {
            method: 'PUT',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + "/activated",
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert("La cuenta se ha reactivado correctamente", "La cuenta se ha reactivado correctamente", "Cerrar");
            $route.reload();
        })
            .catch(function(response){
                if(response.status==400){
                    AlertService.alert('Error', "La cuenta seleccionada no es valida para realizar esta operación.", "Cerrar");
                }
                else if(response.status==403){
                    AlertService.alert("Error", "El usuario no es propietario de esta cuenta.", "Cerrar");
                }
                else if(response.status==404){
                    AlertService.alert("Error", "El sistema no encuentra el id de la cuenta seleccionada.", "Cerrar");
                }
                else if(response.status==500){
                    AlertService.alert('Error',"Error reactivando la cuenta de Twitter seleccionada.", "Cerrar");
                }
            });
    }
});
