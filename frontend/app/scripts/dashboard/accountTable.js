/**
 * Created by sergiopedrerobenedi on 22/6/17.
 */

var app = angular.module('app');

/**
 *  Controller for handle account table information.
 */
app.controller('accountTableCtrl', function ($http, $rootScope, $uibModal, $route, AlertService,$location) {

    var accountCtrl = this;
    accountCtrl.active = false;
    $rootScope.activeAccount = accountCtrl.active;

        /**
         * GET TWITTER ACCOUNTS
         * @type {{method: string, url: string, headers: {Content-Type: string, token}}}
         */
        var req = {
            method: 'GET',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            accountCtrl.accountList = response.data;
            if (accountCtrl.accountList.length != 0) {
                if(response.data[0].activated) {
                    accountCtrl.selectAccount(response.data[0]);
                }
            }
        })
            .catch(function (response) {
                if (response.status == 403) {
                    localStorage.clear();
                    $location.url('/');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error getting Twitter accounts from database.', 'Close');
                }
            });

    /**
     * SELECTS AN ACCOUNT FROM LIST
     * @param account
     */
    accountCtrl.selectAccount = function (account) {
        accountCtrl.active = account._id;
        $rootScope.activeAccount = account.activated;
        localStorage.setItem('selectedAccount', account._id);
    };

    accountCtrl.setClickedRow = function (index) {
        accountCtrl.selectedRow = index;
    }


    /**
     * SHOWS DELETE MODAL
     */
    accountCtrl.showDeleteModal = function () {
        AlertService.alert('Delete account', 'Are you sure you want to delete this account?', 'Yes', accountCtrl.deleteAccount, 'Cancel');

    };
    /**
     * DELETE AN ACCOUNT SELECTED FROM LIST
     */
    accountCtrl.deleteAccount = function () {
        var req = {
            method: 'DELETE',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
            + localStorage.getItem('selectedAccount'),
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function () {
            AlertService.alert('Account deleted', "The Organic Law of Data Protection obliges us to keep your account in " +
                "our servers during the term of six months. Nothing we would like more than to follow your instructions" +
                " to delete the account, but as it is not possible in return we offer you the possibility to recover it" +
                " whenever you request it within this period. Sincerely, Zaratech PTM team", 'Close');
            $route.reload();
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for delete operation.', 'Close');
                }

                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Unable to find selected account.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error getting Twitter accounts from database.', 'Close');
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
    /**
     * REACTIVATES AN ACCOUNT DELETED PREVIOUSLY
     */
    accountCtrl.reactivate = function (account) {
        localStorage.setItem('selectedAccount', account._id);
        var req = {
            method: 'PUT',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + "/activated",
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function () {
            AlertService.alert("Account successfully reactivated", "The account has been successfully reactivated.", "Close");
            $route.reload();
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for reactivate operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Unable to find selected account.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error getting Twitter accounts from database.', 'Close');
                }
            });
    }
});
