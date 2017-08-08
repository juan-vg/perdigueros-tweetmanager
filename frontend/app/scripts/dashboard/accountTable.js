/**
 * Created by sergiopedrerobenedi on 22/6/17.
 */

var app = angular.module('app');

/**
 *
 */
app.controller('accountTableCtrl',  function ($http,$rootScope,$uibModal,$route,AlertService) {
    var accountCtrl = this;
    accountCtrl.active = false;
    $rootScope.activeAccount = accountCtrl.active;
        // Create account function of account panel
        accountCtrl.createAccount = function() {
            console.log('here');
            var req = {
                method: 'POST',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                data: {
                    'information': {
                        'consumerKey': accountCtrl.consumerKey,
                        'consumerSecret': accountCtrl.consumerSecret,
                        'accessToken': accountCtrl.accessToken,
                        'accessTokenSecret': accountCtrl.accessTokenSecret
                    },
                    'description': accountCtrl.description
                }
            };
            $http(req).then(function (response) {
                console.log(response);
            });
        };
        console.log('Get accounts');
        var req = {
            method: 'GET',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
            headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            console.log(response.data);
            accountCtrl.accountList =  response.data;
        });

        accountCtrl.selectAccount = function (account){
            accountCtrl.active = !accountCtrl.active;
            $rootScope.activeAccount = accountCtrl.active;
            localStorage.setItem('selectedAccount',account._id);
        };
        accountCtrl.showDeleteModal = function(){
            AlertService.alert('Eliminar cuenta ', '¿Está seguro de que desea eliminar esta cuenta?', 'Si', accountCtrl.deleteAccount, 'Cancelar');
        };
        accountCtrl.deleteAccount = function(){
            var req = {
                method: 'DELETE',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') ,
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            };
            $http(req).then(function (response) {
                $route.reload();
            });
        }
        accountCtrl.showModal = function() {
            var modalInstance = $uibModal.open({
                templateUrl : 'partials/modal/addTwitterAccount.html',
                controller : 'accountTableCtrl as accountCtrl'
            });
            accountCtrl.cancelModal = function(){
                modalInstance.dismiss();
            };
        }

        accountCtrl.reactivate = function() {
            var req = {
                method: 'PUT',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') +"/activated",
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            };
            $http(req).then(function (response) {
                AlertService.alert("La cuenta se ha reactivado correctamente","La cuenta se ha reactivado correctamente","Cerrar");
                $route.reload();
            });
        }
});
