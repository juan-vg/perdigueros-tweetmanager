/**
 * Created by sergiopedrerobenedi on 12/7/17.
 */

var app = angular.module('app');
/**
 *
 */

app.controller("profileCtrl", function ($http, $scope, AlertService, $location, $rootScope) {
    $rootScope.currentUser = localStorage.getItem('currentUserName');
    var req = {
        method: 'GET',
        url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/'
        + localStorage.getItem('userId'),
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    }
    $http(req).then(function (response) {
        $scope.myInfo = response.data;
    })
        .catch(function (response) {
            if (response.status == 400) {
                AlertService.alert('Error', 'Selected account is not valid for get operation.', 'Close');
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
                AlertService.alert('Error', 'Error getting account information from database.', 'Close');
            }
        });

    /**
     * CHANGES THE CURRENT USER PASSWORD
     */
    $scope.changePassword = function () {
        var req = {
            method: 'PUT',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/'
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
        $http(req).then(function () {
            AlertService.alert('Congratulations', 'Password has been changed successfully', 'Close');
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for update password operation.', 'Close');
                }
                else if (response.status == 401) {
                    AlertService.alert('Error', 'The provided old password does not match the one in database.Please, try again.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Unable to find the account for change password.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error changing account password from database.', 'Close');
                }
            });
    }

    $scope.removeAccount = function () {
        var req = {
            method: 'DELETE',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/' + localStorage.getItem('userId'),
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
        };
        $http(req).then(function () {
            AlertService.alert('Account deleted', "The Organic Law of Data Protection obliges us to keep your account in " +
                "our servers during the term of six months. Nothing we would like more than to follow your instructions" +
                " to delete the account, but as it is not possible in return we offer you the possibility to recover it" +
                " whenever you request it within this period. Sincerely, Zaratech PTM team", 'Close');
            localStorage.clear();
            $location.url('/');
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for delete account operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Unable to find the account for delete.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error deleting account from database.', 'Close');
                }
            });

    }
    $scope.showDeleteModal = function () {
        AlertService.alert('Delete account', 'Are you sure you want to delete this account?', 'Yes', $scope.removeAccount, 'Cancel');
    }
});